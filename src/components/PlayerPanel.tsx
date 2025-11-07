import React, { useState, useEffect } from 'react';
import styles from './PlayerPanel.module.css';

interface Stock {
  name: string;
  price: number;
  shares: number;
}

interface Player {
  id: string;
  name: string;
  money: number;
  netWorth: number;
  stocks: Record<string, number>;
  role: 'player' | 'banker';
}

interface PlayerPanelProps {
  player: Player;
  isCurrentUser?: boolean;
  onTrade?: (playerId: string, stockName: string, action: 'buy' | 'sell' | 'rights', quantity: number) => void;
  stocks: Stock[];
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({ 
  player, 
  isCurrentUser = false, 
  onTrade,
  stocks 
}) => {
  const [selectedStock, setSelectedStock] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [action, setAction] = useState<'buy' | 'sell' | 'rights'>('buy');
  const [spendAmount, setSpendAmount] = useState(0);
  const [selectedQuantities, setSelectedQuantities] = useState<number[]>([]);
  
  // Allowed share quantities (in multiples of 1k)
  const allowedQuantities = [1000, 5000, 10000, 50000];
  
  // Count occurrences of each quantity
  const getQuantityCount = (qty: number) => {
    return selectedQuantities.filter(q => q === qty).length;
  };

  const stockNames = ['WOCKHARDT', 'HDFC', 'TISCO', 'ONGC', 'RELIANCE', 'INFOSYS'];

  const getStockPrice = (stockName: string) => {
    const stock = stocks.find(s => s.name === stockName);
    return stock ? stock.price : 0;
  };

  const getCurrentShares = (stockName: string) => {
    return player.stocks[stockName] || 0;
  };

  // Calculate max buyable shares based on cash
  const getMaxBuyableShares = (stockName: string) => {
    const stock = stocks.find(s => s.name === stockName);
    if (!stock || stock.price === 0) return 0;
    return Math.floor(player.money / stock.price);
  };

  // Calculate max shortable shares based on networth
  const getMaxShortableShares = (stockName: string) => {
    const stock = stocks.find(s => s.name === stockName);
    if (!stock || stock.price === 0) return 0;
    
    // Calculate current short value
    const currentShortValue = Object.entries(player.stocks)
      .filter(([, shares]) => shares < 0)
      .reduce((total, [name, shares]) => {
        const s = stocks.find(st => st.name === name);
        return total + (s ? Math.abs(s.price * shares) : 0);
      }, 0);
    
    // Available networth for new shorts
    const availableNetworth = player.netWorth - currentShortValue;
    return Math.floor(availableNetworth / stock.price);
  };

  // Calculate max sellable shares (owned + shortable)
  const getMaxSellableShares = (stockName: string) => {
    const owned = getCurrentShares(stockName);
    const shortable = getMaxShortableShares(stockName);
    return owned + shortable;
  };

  // Update quantity when stock or action changes
  useEffect(() => {
    if (!selectedStock) {
      setQuantity(0);
      setSpendAmount(0);
      return;
    }

    const stock = stocks.find(s => s.name === selectedStock);
    if (!stock) return;

    if (action === 'buy') {
      const maxShares = Math.min(getMaxBuyableShares(selectedStock), stock.shares);
      setQuantity(Math.min(quantity, maxShares));
      setSpendAmount(quantity * stock.price);
    } else {
      const maxShares = getMaxSellableShares(selectedStock);
      setQuantity(Math.min(quantity, maxShares));
      setSpendAmount(quantity * stock.price);
    }
  }, [selectedStock, action, stocks]);

  // Update quantity when spend amount changes (for buy)
  useEffect(() => {
    if (action === 'buy' && selectedStock) {
      const stock = stocks.find(s => s.name === selectedStock);
      if (stock && stock.price > 0) {
        const maxShares = Math.min(getMaxBuyableShares(selectedStock), stock.shares);
        const newQuantity = Math.min(Math.floor(spendAmount / stock.price), maxShares);
        setQuantity(newQuantity);
        setSpendAmount(newQuantity * stock.price);
      }
    }
  }, [spendAmount, action, selectedStock, stocks]);

  const handleTrade = () => {
    if (!selectedStock || !onTrade || quantity === 0) return;
    
    const stock = stocks.find(s => s.name === selectedStock);
    if (!stock) return;
    
    const currentShares = getCurrentShares(selectedStock);
    
    if (action === 'rights') {
      const totalCost = quantity * 10; // Rights at ₹10
      if (player.money < totalCost) {
        alert(`Insufficient funds! You need ₹${totalCost.toLocaleString()} but have ₹${player.money.toLocaleString()}`);
        return;
      }
      // Rights don't affect available shares, they're new shares issued
    } else if (action === 'sell') {
      const maxSellable = getMaxSellableShares(selectedStock);
      if (quantity > maxSellable) {
        alert(`Cannot sell/short ${quantity} shares. Maximum: ${maxSellable} (${currentShares} owned + ${maxSellable - currentShares} shortable)`);
        return;
      }
    } else { // buy
      const totalCost = stock.price * quantity;
      if (player.money < totalCost) {
        alert(`Insufficient funds! You need ₹${totalCost.toLocaleString()} but have ₹${player.money.toLocaleString()}`);
        return;
      }
      
      if (stock.shares < quantity) {
        alert(`Only ${stock.shares.toLocaleString()} shares of ${selectedStock} available. Cannot buy ${quantity.toLocaleString()} shares.`);
        return;
      }
    }
    
    onTrade(player.id, selectedStock, action, quantity);
    
    // Reset form
    setSelectedStock('');
    setQuantity(0);
    setSpendAmount(0);
    setSelectedQuantities([]);
    setAction('buy');
  };


  const getStockInfo = (stockName: string) => {
    const stock = stocks.find(s => s.name === stockName);
    if (!stock) return null;
    const owned = getCurrentShares(stockName);
    const shortable = getMaxShortableShares(stockName);
    return { stock, owned, shortable, available: stock.shares };
  };

  return (
    <div className={`${styles.panel} ${isCurrentUser ? styles.currentUser : ''}`}>
      <div className={styles.header}>
        <h3>{player.name} {isCurrentUser && '(You)'}</h3>
        {isCurrentUser && (
          <div className={styles.status}>
            <span className={styles.money}>Cash: ₹{player.money.toLocaleString()}</span>
          </div>
        )}
      </div>

      {isCurrentUser && (
        <div className={styles.portfolio}>
          <h4>Portfolio</h4>
          <div className={styles.stocks}>
            {stockNames.map(stock => {
              const info = getStockInfo(stock);
              if (!info) return null;
              const { stock: stockData, owned, shortable } = info;
              const value = owned * stockData.price;
              const isShort = owned < 0;
              return (
                <div key={stock} className={styles.stockItem}>
                  <span className={styles.stockName}>{stock}</span>
                  <div className={styles.stockDetails}>
                    <span className={`${styles.stockQuantity} ${isShort ? styles.short : ''}`}>
                      {owned > 0 ? `${owned} shares` : owned < 0 ? `Short ${Math.abs(owned)}` : '0 shares'}
                    </span>
                    {owned !== 0 && <span className={styles.stockValue}>₹{value.toLocaleString()}</span>}
                    <span className={styles.availableInfo}>
                      {action === 'buy' ? `Available: ${info.available.toLocaleString()}` : `Can short: ${shortable.toLocaleString()}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCurrentUser && (
        <div className={styles.tradeSection}>
          <h4>Trade</h4>
          <div className={styles.tradeControls}>
            <select 
              value={selectedStock} 
              onChange={(e) => {
                setSelectedStock(e.target.value);
                setQuantity(0);
                setSpendAmount(0);
                setSelectedQuantities([]);
              }}
              className={styles.select}
            >
              <option value="">Select Stock</option>
              {stockNames.map(stock => {
                const stockData = stocks.find(s => s.name === stock);
                const info = getStockInfo(stock);
                return (
                  <option key={stock} value={stock}>
                    {stock} - ₹{stockData?.price || 0} 
                    {info && ` (${info.available.toLocaleString()} available)`}
                  </option>
                );
              })}
            </select>
            
            <div className={styles.actionButtons}>
              <button 
                className={`${styles.actionBtn} ${action === 'buy' ? styles.active : ''}`}
                onClick={() => {
                  setAction('buy');
                  setQuantity(0);
                  setSpendAmount(0);
                  setSelectedQuantities([]);
                }}
              >
                Buy
              </button>
              <button 
                className={`${styles.actionBtn} ${action === 'sell' ? styles.active : ''}`}
                onClick={() => {
                  setAction('sell');
                  setQuantity(0);
                  setSpendAmount(0);
                }}
              >
                Sell/Short
              </button>
              <button 
                className={`${styles.actionBtn} ${action === 'rights' ? styles.active : ''}`}
                onClick={() => {
                  setAction('rights');
                  setQuantity(0);
                  setSpendAmount(0);
                }}
              >
                Rights (₹10)
              </button>
            </div>
            
            {selectedStock && (
              <>
                {(action === 'buy' || action === 'sell' || action === 'rights') && (
                  <>
                    <div className={styles.quantitySelector}>
                      <label>Select Quantity (click to add):</label>
                      <div className={styles.quantityButtons}>
                        {allowedQuantities.map(qty => {
                          const maxQty = action === 'buy' 
                            ? Math.min(getMaxBuyableShares(selectedStock), stocks.find(s => s.name === selectedStock)?.shares || 0)
                            : action === 'sell'
                            ? getMaxSellableShares(selectedStock)
                            : Math.floor(player.money / 10); // Rights at ₹10
                          
                          const currentTotal = selectedQuantities.reduce((sum, q) => sum + q, 0);
                          const canSelect = (currentTotal + qty) <= maxQty;
                          const count = getQuantityCount(qty);
                          const isSelected = count > 0;
                          
                          return (
                            <button
                              key={qty}
                              type="button"
                              className={`${styles.quantityBtn} ${isSelected ? styles.selected : ''} ${!canSelect ? styles.disabled : ''}`}
                              onClick={() => {
                                if (!canSelect) return;
                                
                                // Always add, never remove (allow multiple of same quantity)
                                const newSelected = [...selectedQuantities, qty];
                                
                                setSelectedQuantities(newSelected);
                                const totalQty = newSelected.reduce((sum, q) => sum + q, 0);
                                setQuantity(totalQty);
                                
                                if (action === 'buy') {
                                  setSpendAmount(totalQty * getStockPrice(selectedStock));
                                } else if (action === 'sell') {
                                  setSpendAmount(totalQty * getStockPrice(selectedStock));
                                } else if (action === 'rights') {
                                  setSpendAmount(totalQty * 10);
                                }
                              }}
                              disabled={!canSelect}
                            >
                              {qty >= 1000 ? `${qty / 1000}k` : qty}
                              {count > 0 && ` (${count})`}
                            </button>
                          );
                        })}
                      </div>
                      {selectedQuantities.length > 0 && (
                        <div className={styles.selectedBreakdown}>
                          <span>Selected: {(() => {
                            const breakdown: string[] = [];
                            allowedQuantities.forEach(qty => {
                              const count = getQuantityCount(qty);
                              if (count > 0) {
                                const label = qty >= 1000 ? `${qty/1000}k` : qty.toString();
                                if (count === 1) {
                                  breakdown.push(label);
                                } else {
                                  breakdown.push(`${count}×${label}`);
                                }
                              }
                            });
                            return breakdown.join(' + ');
                          })()} = {quantity.toLocaleString()}</span>
                          <button 
                            type="button"
                            className={styles.clearButton}
                            onClick={() => {
                              setSelectedQuantities([]);
                              setQuantity(0);
                              setSpendAmount(0);
                            }}
                          >
                            Clear
                          </button>
                        </div>
                      )}
                      <div className={styles.quantityInfo}>
                        {action === 'buy' && (
                          <>
                            <span>Max: {Math.min(getMaxBuyableShares(selectedStock), stocks.find(s => s.name === selectedStock)?.shares || 0).toLocaleString()} shares</span>
                            <span>Price: ₹{getStockPrice(selectedStock).toLocaleString()}/share</span>
                            {quantity > 0 && <span>Total: ₹{(quantity * getStockPrice(selectedStock)).toLocaleString()}</span>}
                          </>
                        )}
                        {action === 'sell' && (
                          <>
                            <span>Owned: {getCurrentShares(selectedStock).toLocaleString()}</span>
                            <span>Can short: {getMaxShortableShares(selectedStock).toLocaleString()}</span>
                            {quantity > 0 && <span>Total: ₹{(quantity * getStockPrice(selectedStock)).toLocaleString()}</span>}
                          </>
                        )}
                        {action === 'rights' && (
                          <>
                            <span>Rights Price: ₹10/share</span>
                            <span>Max: {Math.floor(player.money / 10).toLocaleString()} shares</span>
                            {quantity > 0 && <span>Total: ₹{(quantity * 10).toLocaleString()}</span>}
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
            
            <button 
              className={styles.tradeBtn}
              onClick={handleTrade}
              disabled={!selectedStock || quantity === 0}
            >
              {action === 'rights' 
                ? `BUY RIGHTS ${quantity.toLocaleString()} @ ₹10`
                : `${action.toUpperCase()} ${quantity.toLocaleString()} ${selectedStock && `@ ₹${action === 'buy' ? getStockPrice(selectedStock).toLocaleString() : getStockPrice(selectedStock).toLocaleString()}`}`
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerPanel;
