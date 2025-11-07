import React, { useState, useEffect } from 'react';
import styles from './Notifications.module.css';

interface TradeNotification {
  id: string;
  playerName: string;
  action: 'buy' | 'sell' | 'rights';
  stockName: string;
  quantity: number;
  price: number;
  timestamp: Date;
}

interface NotificationsProps {
  notifications: TradeNotification[];
}

const Notifications: React.FC<NotificationsProps> = ({ notifications }) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return new Date(date).toLocaleTimeString();
  };

  const getActionIcon = (action: string) => {
    if (action === 'buy') return '📈';
    if (action === 'sell') return '📉';
    if (action === 'rights') return '🎫';
    return '💰';
  };

  const getActionColor = (action: string) => {
    if (action === 'buy') return '#28a745';
    if (action === 'sell') return '#dc3545';
    if (action === 'rights') return '#ffc107';
    return '#666';
  };

  return (
    <div className={styles.notificationsContainer}>
      <button 
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>🔔 Notifications {notifications.length > 0 && `(${notifications.length})`}</span>
        <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div className={styles.notifications}>
          <h3>Recent Trades</h3>
          <div className={styles.notificationsList}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>No trades yet</div>
            ) : (
              notifications.slice().reverse().map((notif) => (
                <div key={notif.id} className={styles.notificationItem}>
                  <div className={styles.notificationHeader}>
                    <span className={styles.notificationIcon}>{getActionIcon(notif.action)}</span>
                    <span className={styles.playerName}>{notif.playerName}</span>
                    <span 
                      className={styles.action}
                      style={{ color: getActionColor(notif.action) }}
                    >
                      {notif.action.toUpperCase()}
                    </span>
                  </div>
                  <div className={styles.notificationDetails}>
                    <span className={styles.stockName}>{notif.stockName}</span>
                    <span className={styles.quantity}>{notif.quantity.toLocaleString()} shares</span>
                    {notif.action === 'rights' ? (
                      <span className={styles.price}>@ ₹10</span>
                    ) : (
                      <span className={styles.price}>@ ₹{notif.price.toLocaleString()}</span>
                    )}
                  </div>
                  <div className={styles.notificationFooter}>
                    <span className={styles.timestamp}>{formatTime(notif.timestamp)}</span>
                    <span className={styles.total}>
                      Total: ₹{notif.action === 'rights' 
                        ? (notif.quantity * 10).toLocaleString()
                        : (notif.quantity * notif.price).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;

