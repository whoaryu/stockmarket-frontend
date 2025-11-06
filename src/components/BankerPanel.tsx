import React, { useState } from 'react';
import styles from './BankerPanel.module.css';

interface Stock {
  name: string;
  price: number;
  shares: number;
}

interface BankerPanelProps {
  onPriceChange: (stockName: string, change: number) => void;
  stocks: Stock[];
}

const BankerPanel: React.FC<BankerPanelProps> = ({ onPriceChange, stocks }) => {
  const [selectedStock, setSelectedStock] = useState('');
  const [priceChange, setPriceChange] = useState(1);
  const [action, setAction] = useState<'increase' | 'decrease'>('increase');

  const stockNames = ['WOCKHARDT', 'HDFC', 'TISCO', 'ONGC', 'RELIANCE', 'INFOSYS'];

  const handlePriceUpdate = () => {
    if (!selectedStock) return;
    
    const change = action === 'increase' ? priceChange : -priceChange;
    onPriceChange(selectedStock, change);
    
    // Reset form
    setSelectedStock('');
    setPriceChange(1);
    setAction('increase');
  };

  const getStockPrice = (stockName: string) => {
    const stock = stocks.find(s => s.name === stockName);
    return stock ? stock.price : 0;
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>Banker Controls</h3>
        <span className={styles.badge}>Banker</span>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label>Select Stock</label>
          <select 
            value={selectedStock} 
            onChange={(e) => setSelectedStock(e.target.value)}
            className={styles.select}
          >
            <option value="">Choose a stock</option>
            {stockNames.map(stock => (
              <option key={stock} value={stock}>
                {stock} - ₹{getStockPrice(stock)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label>Price Change</label>
          <div className={styles.priceControls}>
            <div className={styles.actionButtons}>
              <button 
                className={`${styles.actionBtn} ${action === 'increase' ? styles.active : ''}`}
                onClick={() => setAction('increase')}
              >
                Increase
              </button>
              <button 
                className={`${styles.actionBtn} ${action === 'decrease' ? styles.active : ''}`}
                onClick={() => setAction('decrease')}
              >
                Decrease
              </button>
            </div>
            <input
              type="number"
              value={priceChange}
              onChange={(e) => setPriceChange(Number(e.target.value))}
              className={styles.priceInput}
              min="0.5"
              max="10"
              step="0.5"
            />
          </div>
        </div>

        <button 
          className={styles.updateBtn}
          onClick={handlePriceUpdate}
          disabled={!selectedStock}
        >
          {action === 'increase' ? 'Increase' : 'Decrease'} Price by ₹{priceChange}
        </button>
      </div>

      <div className={styles.info}>
        <p>As a banker, you control stock prices. Use this panel to increase or decrease prices during the game.</p>
      </div>
    </div>
  );
};

export default BankerPanel; 