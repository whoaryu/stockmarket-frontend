import React from 'react';
import styles from './StockPriceBoard.module.css';

interface Stock {
  name: string;
  price: number;
  shares: number;
}

interface StockPriceBoardProps {
  stocks: Stock[];
}

const StockPriceBoard: React.FC<StockPriceBoardProps> = ({ stocks }) => {
  return (
    <div className={styles.board}>
      <h2 className={styles.title}>Live Stock Prices</h2>
      <div className={styles.stockGrid}>
        {stocks.map(stock => (
          <div key={stock.name} className={styles.stockCard}>
            <div className={styles.stockHeader}>
              <h3>{stock.name}</h3>
              <span className={styles.shares}>{stock.shares.toLocaleString()} shares left</span>
            </div>
            <div className={styles.priceInfo}>
              <span className={styles.price}>₹{stock.price.toFixed(2)}</span>
            </div>
            <div className={styles.miniGraph}>
              {/* Placeholder for mini graph */}
              <div className={styles.graphBar}></div>
              <div className={styles.graphBar}></div>
              <div className={styles.graphBar}></div>
              <div className={styles.graphBar}></div>
              <div className={styles.graphBar}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockPriceBoard; 