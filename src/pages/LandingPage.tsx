import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './LandingPage.module.css';
import RoomCodeInput from '../components/RoomCodeInput';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomCode: urlRoomCode } = useParams<{ roomCode?: string }>();
  const [roomCode, setRoomCode] = useState(urlRoomCode || '');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'banker' | 'player' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    if (!name || role !== 'banker') {
      setError('Banker must create the room');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://stockmarket-backend-1s7o.onrender.com/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create room');
      }
      
      localStorage.setItem('userInfo', JSON.stringify({
        name,
        role,
        roomCode: data.room.roomCode,
        playerId: data.playerId
      }));
      
      navigate(`/game/${data.room.roomCode}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!name || !roomCode || roomCode.length !== 6) {
      setError('Please enter your name and a valid 6-digit room code');
      return;
    }
    
    if (role === 'banker') {
      setError('Banker cannot join as player. Create a new room instead.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`https://stockmarket-backend-1s7o.onrender.com/api/room/${roomCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to join room');
      }
      
      localStorage.setItem('userInfo', JSON.stringify({
        name,
        role: 'player',
        roomCode: data.room.roomCode,
        playerId: data.playerId
      }));
      
      navigate(`/game/${data.room.roomCode}`);
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const isJoining = urlRoomCode || roomCode.length === 6;

  return (
    <div className={styles.landingContainer}>
      <h1 className={styles.title}>Indian Stock Market Game</h1>
      <div className={styles.card}>
        <h2>{isJoining ? 'Join Room' : 'Create or Join a Room'}</h2>
        
        <input
          className={styles.input}
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={loading}
        />
        
        {!urlRoomCode && (
          <>
            <div className={styles.roomCodeLabel}>Room Code (6 digits)</div>
            <RoomCodeInput
              value={roomCode}
              onChange={setRoomCode}
              disabled={loading}
            />
          </>
        )}
        
        {urlRoomCode && (
          <div className={styles.roomCodeDisplay}>
            Room Code: <strong>{urlRoomCode}</strong>
          </div>
        )}
        
        {!isJoining && (
          <div className={styles.roleSelect}>
            <label>
              <input
                type="radio"
                name="role"
                value="player"
                checked={role === 'player'}
                onChange={() => setRole('player')}
                disabled={loading}
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
                disabled={loading}
              />
              Banker (Host)
            </label>
          </div>
        )}
        
        {error && <div className={styles.error}>{error}</div>}
        
        <button 
          className={styles.button} 
          disabled={!name || loading || (!isJoining && !role) || (isJoining && roomCode.length !== 6)}
          onClick={isJoining ? handleJoinRoom : handleCreateRoom}
        >
          {loading ? 'Loading...' : (isJoining ? 'Join Room' : role === 'banker' ? 'Create Room' : 'Join Room')}
        </button>
        
        {!isJoining && role === 'banker' && (
          <p className={styles.hint}>As Banker, you will create and host the game</p>
        )}
      </div>
    </div>
  );
};

export default LandingPage; 