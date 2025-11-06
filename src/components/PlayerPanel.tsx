import React, { useState } from 'react';
import styles from './PlayerPanel.module.css';

interface Stock {
  name: string;
  price: number;
  shares: number;
}

interface Player {
  id: number;
  name: string;
  money: number;
  netWorth: number;
  stocks: Record<string, number>;
  role: 'player' | 'banker';
}

interface PlayerPanelProps {
  player: Player;
  isCurrentUser?: boolean;
  onTrade?: (playerId: number, stockName: string, action: 'buy' | 'sell', quantity: number) => void;
  stocks: Stock[];
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({ 
  player, 
  isCurrentUser = false, 
  onTrade,
  stocks 
}) => {
  const [selectedStock, setSelectedStock] = useState('');
  const [quantity, setQuantity] = useState(1000);
  const [action, setAction] = useState<'buy' | 'sell'>('buy');

  const stockNames = ['WOCKHARDT', 'HDFC', 'TISCO', 'ONGC', 'RELIANCE', 'INFOSYS'];

  const handleTrade = () => {
    if (!selectedStock || !onTrade) return;
    
    const stock = stocks.find(s => s.name === selectedStock);
    if (!stock) return;
    
    const currentShares = player.stocks[selectedStock] || 0;
    const totalCost = stock.price * quantity;
    
    if (action === 'sell' && currentShares < quantity) {
      alert(`You only have ${currentShares} shares of ${selectedStock}. Cannot sell ${quantity} shares.`);
      return;
    }
    
    if (action === 'buy' && player.money < totalCost) {
      alert(`Insufficient funds! You need ₹${totalCost.toLocaleString()} but have ₹${player.money.toLocaleString()}`);
      return;
    }
    
    if (action === 'buy' && stock.shares < quantity) {
      alert(`Only ${stock.shares.toLocaleString()} shares of ${selectedStock} available. Cannot buy ${quantity.toLocaleString()} shares.`);
      return;
    }
    
    onTrade(player.id, selectedStock, action, quantity);
    
    // Reset form
    setSelectedStock('');
    setQuantity(1000);
    setAction('buy');
  };

  const canSellStock = (stockName: string) => {
    const currentShares = player.stocks[stockName] || 0;
    return currentShares > 0;
  };

  const getStockPrice = (stockName: string) => {
    const stock = stocks.find(s => s.name === stockName);
    return stock ? stock.price : 0;
  };

  return (
    <div className={`${styles.panel} ${isCurrentUser ? styles.currentUser : ''}`}>
      <div className={styles.header}>
        <h3>{player.name} {isCurrentUser && '(You)'}</h3>
        <div className={styles.status}>
          <span className={styles.netWorth}>₹{player.netWorth.toLocaleString()}</span>
          <span className={styles.money}>₹{player.money.toLocaleString()}</span>
        </div>
      </div>

      <div className={styles.portfolio}>
        <h4>Portfolio</h4>
        <div className={styles.stocks}>
          {stockNames.map(stock => {
            const shares = player.stocks[stock] || 0;
            const price = getStockPrice(stock);
            const value = shares * price;
            return (
              <div key={stock} className={styles.stockItem}>
                <span className={styles.stockName}>{stock}</span>
                <div className={styles.stockDetails}>
                  <span className={styles.stockQuantity}>{shares} shares</span>
                  {shares > 0 && <span className={styles.stockValue}>₹{value.toLocaleString()}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isCurrentUser && (
        <div className={styles.tradeSection}>
          <h4>Trade</h4>
          <div className={styles.tradeControls}>
            <select 
              value={selectedStock} 
              onChange={(e) => setSelectedStock(e.target.value)}
              className={styles.select}
            >
              <option value="">Select Stock</option>
              {stockNames.map(stock => (
                <option key={stock} value={stock}>{stock} - ₹{getStockPrice(stock)}</option>
              ))}
            </select>
            
            <div className={styles.actionButtons}>
              <button 
                className={`${styles.actionBtn} ${action === 'buy' ? styles.active : ''}`}
                onClick={() => setAction('buy')}
              >
                Buy
              </button>
              <button 
                className={`${styles.actionBtn} ${action === 'sell' ? styles.active : ''}`}
                onClick={() => setAction('sell')}
                disabled={selectedStock && !canSellStock(selectedStock)}
              >
                Sell
              </button>
            </div>
            
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className={styles.quantityInput}
              placeholder="Quantity"
              min="100"
              step="100"
            />
            
            {selectedStock && (
              <div className={styles.tradeInfo}>
                <span>Total: ₹{(getStockPrice(selectedStock) * quantity).toLocaleString()}</span>
              </div>
            )}
            
            <button 
              className={styles.tradeBtn}
              onClick={handleTrade}
              disabled={!selectedStock || (action === 'sell' && !canSellStock(selectedStock))}
            >
              {action.toUpperCase()} {quantity.toLocaleString()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerPanel; 