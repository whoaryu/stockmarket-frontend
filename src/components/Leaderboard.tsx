import React, { useState, useEffect } from 'react';
import styles from './Leaderboard.module.css';

interface Player {
  id: string;
  name: string;
  netWorth: number;
  role: 'player' | 'banker';
}

interface LeaderboardProps {
  players: Player[];
  currentUserId: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ players, currentUserId }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Sort players by networth (descending)
  const sortedPlayers = [...players].sort((a, b) => b.netWorth - a.netWorth);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return (
    <>
      <button 
        className={styles.toggleButton}
        onClick={() => setIsOpen(true)}
      >
        <span>📊 Leaderboard</span>
      </button>
      
      {isOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>🏆 Leaderboard</h2>
              <button className={styles.closeButton} onClick={() => setIsOpen(false)}>×</button>
            </div>
            <div className={styles.rankings}>
              {sortedPlayers.map((player, index) => {
                const rank = index + 1;
                const isCurrentUser = player.id === currentUserId;
                return (
                  <div 
                    key={player.id} 
                    className={`${styles.rankItem} ${isCurrentUser ? styles.currentUser : ''}`}
                  >
                    <span className={styles.rank}>{getRankIcon(rank)}</span>
                    <span className={styles.name}>
                      {player.name}
                      {isCurrentUser && ' (You)'}
                      {player.role === 'banker' && ' 👑'}
                    </span>
                    <span className={styles.netWorth}>₹{player.netWorth.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Leaderboard;

