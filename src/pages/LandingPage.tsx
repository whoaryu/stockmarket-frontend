import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'banker' | 'player' | ''>('');

  const handleJoinRoom = () => {
    if (!name || !role) return;
    
    // Store user info in localStorage for the game
    localStorage.setItem('userInfo', JSON.stringify({
      name,
      role,
      roomCode: roomCode || 'ABC123' // Generate room code if creating
    }));
    
    // Navigate to game dashboard
    navigate('/game');
  };

  return (
    <div className={styles.landingContainer}>
      <h1 className={styles.title}>Indian Stock Market Game</h1>
      <div className={styles.card}>
        <h2>Join or Create a Room</h2>
        <input
          className={styles.input}
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          className={styles.input}
          type="text"
          placeholder="Room Code (leave blank to create)"
          value={roomCode}
          onChange={e => setRoomCode(e.target.value.toUpperCase())}
        />
        <div className={styles.roleSelect}>
          <label>
            <input
              type="radio"
              name="role"
              value="player"
              checked={role === 'player'}
              onChange={() => setRole('player')}
            />
            Player
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="banker"
              checked={role === 'banker'}
              onChange={() => setRole('banker')}
            />
            Banker
          </label>
        </div>
        <button 
          className={styles.button} 
          disabled={!name || !role}
          onClick={handleJoinRoom}
        >
          {roomCode ? 'Join Room' : 'Create Room'}
        </button>
      </div>
    </div>
  );
};

export default LandingPage; 