import React, { useState, useEffect } from 'react';
import styles from './GameDashboard.module.css';
import StockPriceBoard from '../components/StockPriceBoard';
import PlayerPanel from '../components/PlayerPanel';
import BankerPanel from '../components/BankerPanel';

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

const GameDashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([
    { name: 'WOCKHARDT', price: 20, shares: 200000 },
    { name: 'HDFC', price: 25, shares: 200000 },
    { name: 'TISCO', price: 40, shares: 200000 },
    { name: 'ONGC', price: 55, shares: 200000 },
    { name: 'RELIANCE', price: 75, shares: 200000 },
    { name: 'INFOSYS', price: 80, shares: 200000 },
  ]);

  useEffect(() => {
    // Get user info from localStorage
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { name, role, roomCode } = JSON.parse(userInfo);
      const newUser: Player = {
        id: Date.now(),
        name,
        money: 1000000, // 10 lakh starting money
        netWorth: 1000000,
        stocks: {},
        role
      };
      setCurrentUser(newUser);
      
      // Add current user to players list
      setPlayers([newUser]);
    }
  }, []);

  const handleTrade = (playerId: number, stockName: string, action: 'buy' | 'sell', quantity: number) => {
    const stock = stocks.find(s => s.name === stockName);
    if (!stock) return;

    const totalCost = stock.price * quantity;
    
    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        if (player.id !== playerId) return player;
        
        let newMoney = player.money;
        let newStocks = { ...player.stocks };
        
        if (action === 'buy') {
          if (newMoney < totalCost) {
            alert('Insufficient funds!');
            return player;
          }
          newMoney -= totalCost;
          newStocks[stockName] = (newStocks[stockName] || 0) + quantity;
        } else { // sell
          const currentShares = newStocks[stockName] || 0;
          if (currentShares < quantity) {
            alert(`You only have ${currentShares} shares of ${stockName}. Cannot sell ${quantity} shares.`);
            return player;
          }
          newMoney += totalCost;
          newStocks[stockName] = currentShares - quantity;
        }
        
        // Calculate new net worth
        const stockValue = Object.entries(newStocks).reduce((total, [stockName, shares]) => {
          const stock = stocks.find(s => s.name === stockName);
          return total + (stock ? stock.price * shares : 0);
        }, 0);
        
        return {
          ...player,
          money: newMoney,
          stocks: newStocks,
          netWorth: newMoney + stockValue
        };
      })
    );

    // Update stock shares available
    setStocks(prevStocks => 
      prevStocks.map(s => 
        s.name === stockName 
          ? { ...s, shares: action === 'buy' ? s.shares - quantity : s.shares + quantity }
          : s
      )
    );
  };

  const handlePriceChange = (stockName: string, change: number) => {
    setStocks(prevStocks => 
      prevStocks.map(s => 
        s.name === stockName 
          ? { ...s, price: Math.max(1, s.price + change) }
          : s
      )
    );
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Stock Market Game</h1>
        <div className={styles.roomInfo}>
          <span>Room: ABC123</span>
          <span>Players: {players.length}</span>
          <span className={styles.userRole}>You: {currentUser.name} ({currentUser.role})</span>
        </div>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.leftPanel}>
          <StockPriceBoard stocks={stocks} />
          {currentUser.role === 'banker' && (
            <BankerPanel onPriceChange={handlePriceChange} stocks={stocks} />
          )}
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.playerGrid}>
            {players.map(player => (
              <PlayerPanel 
                key={player.id} 
                player={player}
                isCurrentUser={player.id === currentUser.id}
                onTrade={handleTrade}
                stocks={stocks}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDashboard; 