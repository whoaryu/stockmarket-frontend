import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import styles from './GameDashboard.module.css';
import StockPriceBoard from '../components/StockPriceBoard';
import PlayerPanel from '../components/PlayerPanel';
import BankerPanel from '../components/BankerPanel';
import Leaderboard from '../components/Leaderboard';
import Notifications from '../components/Notifications';

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

interface Room {
  roomCode: string;
  hostId: string;
  stocks: Stock[];
  players: Player[];
}

const GameDashboard: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    playerName: string;
    action: 'buy' | 'sell' | 'rights';
    stockName: string;
    quantity: number;
    price: number;
    timestamp: Date;
  }>>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo || !roomCode) {
      navigate('/');
      return;
    }

    const { playerId } = JSON.parse(userInfo);
    
    // Initialize Socket.io connection
    const newSocket = io('https://stockmarket-backend-1s7o.onrender.com');
    socketRef.current = newSocket;
    setSocket(newSocket);

    // Join room
    newSocket.emit('join-room', { roomCode, playerId });

    // Listen for room updates
    newSocket.on('room-updated', (updatedRoom: Room) => {
      setRoom(updatedRoom);
      const player = updatedRoom.players.find(p => p.id === playerId);
      if (player) {
        setCurrentUser(player);
      }
    });

    // Listen for trade notifications
    newSocket.on('trade-notification', (data: {
      playerName: string;
      action: 'buy' | 'sell' | 'rights';
      stockName: string;
      quantity: number;
      price: number;
    }) => {
      const notif = {
        id: Date.now().toString(),
        ...data,
        timestamp: new Date()
      };
      setNotifications(prev => [...prev, notif].slice(-50)); // Keep last 50 notifications
    });

    // Listen for errors
    newSocket.on('error', (data: { message: string }) => {
      setError(data.message);
      setTimeout(() => setError(''), 5000);
    });

    // Fetch initial room state
    fetch(`https://stockmarket-backend-1s7o.onrender.com/api/room/${roomCode}`)
      .then(res => res.json())
      .then((data: Room) => {
        setRoom(data);
        const player = data.players.find(p => p.id === playerId);
        if (player) {
          setCurrentUser(player);
        }
      })
      .catch(err => {
        setError('Failed to load room');
        console.error(err);
      });

    return () => {
      newSocket.disconnect();
    };
  }, [roomCode, navigate]);

  const handleTrade = (playerId: string, stockName: string, action: 'buy' | 'sell' | 'rights', quantity: number) => {
    if (!socket || !roomCode) return;
    socket.emit('trade', { roomCode, playerId, stockName, action, quantity });
  };

  const handlePriceChange = (stockName: string, change: number) => {
    if (!socket || !roomCode) return;
    socket.emit('price-change', { roomCode, stockName, change });
  };

  const handleShareUrl = () => {
    const url = `${window.location.origin}/game/${roomCode}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Room URL copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Room URL copied to clipboard!');
    });
  };

  if (!currentUser || !room) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  const players = room.players;

  return (
    <div className={styles.dashboard}>
      {error && (
        <div className={styles.errorBanner}>
          {error}
        </div>
      )}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Stock Market Game</h1>
          <div className={styles.netWorthDisplay}>
            <span className={styles.netWorthLabel}>Your Net Worth:</span>
            <span className={styles.netWorthValue}>₹{currentUser.netWorth.toLocaleString()}</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.roomInfo}>
            <span>Room: {room.roomCode}</span>
            <span>Players: {players.length}/6</span>
            <span className={styles.userRole}>{currentUser.name} ({currentUser.role})</span>
          </div>
          <div className={styles.headerActions}>
            <Notifications notifications={notifications} />
            <Leaderboard players={players} currentUserId={currentUser.id} />
            <button onClick={handleShareUrl} className={styles.shareButton}>
              Share Room
            </button>
          </div>
        </div>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.leftPanel}>
          <StockPriceBoard stocks={room.stocks} />
          {currentUser.role === 'banker' && (
            <BankerPanel onPriceChange={handlePriceChange} stocks={room.stocks} />
          )}
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.playerGrid}>
            <PlayerPanel 
              key={currentUser.id} 
              player={currentUser}
              isCurrentUser={true}
              onTrade={handleTrade}
              stocks={room.stocks}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDashboard;
