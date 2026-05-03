'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Trophy } from 'lucide-react';

export default function BingoNotifier() {
  const [notification, setNotification] = useState<{ name: string, department: string } | null>(null);

  useEffect(() => {
    const socket = io();

    socket.on('bingo-alert', (data) => {
      setNotification(data);
      // Play a sound if you want here
      setTimeout(() => setNotification(null), 10000); // Show for 10 seconds
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!notification) return null;

  return (
    <div className="card animate-fade" style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      zIndex: 1000,
      background: 'var(--success)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
      borderColor: 'rgba(255,255,255,0.2)'
    }}>
      <Trophy size={32} />
      <div>
        <h4 style={{ margin: 0 }}>BINGO!</h4>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>
          <strong>{notification.name}</strong> aus {notification.department} hat gewonnen!
        </p>
      </div>
      <button 
        onClick={() => setNotification(null)}
        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '1rem' }}
      >
        ✕
      </button>
    </div>
  );
}
