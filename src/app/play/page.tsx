'use client';

import { useState, useEffect, useRef } from 'react';
import { Trophy, RefreshCw } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Entry {
  id: string;
  text: string;
}

export default function PlayPage() {
  const [board, setBoard] = useState<Entry[]>([]);
  const [marked, setMarked] = useState<boolean[]>(new Array(25).fill(false));
  const [hasBingo, setHasBingo] = useState(false);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io();
    generateNewBoard();

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const generateNewBoard = async () => {
    setLoading(true);
    setHasBingo(false);
    setMarked(new Array(25).fill(false));

    const deptId = localStorage.getItem('bingo_user_dept');
    
    try {
      const res = await fetch(`/api/play?deptId=${deptId || ''}`);
      const entries: Entry[] = await res.json();
      
      // Shuffle and take 25
      const shuffled = [...entries].sort(() => 0.5 - Math.random());
      setBoard(shuffled.slice(0, 25));
    } catch (err) {
      console.error('Error loading board:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTile = (index: number) => {
    if (hasBingo) return;
    
    const newMarked = [...marked];
    newMarked[index] = !newMarked[index];
    setMarked(newMarked);
    checkBingo(newMarked);
  };

  const checkBingo = (currentMarked: boolean[]) => {
    const lines = [
      // Rows
      [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
      // Cols
      [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
      // Diagonals
      [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
    ];

    for (const line of lines) {
      if (line.every(idx => currentMarked[idx])) {
        setHasBingo(true);
        broadcastBingo();
        return;
      }
    }
  };

  const broadcastBingo = () => {
    const name = localStorage.getItem('bingo_user_name') || 'Jemand';
    const deptId = localStorage.getItem('bingo_user_dept');
    
    socketRef.current?.emit('bingo-win', { 
      name, 
      department: deptId ? 'deiner Abteilung' : 'dem Büro' // Simplified for now
    });
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Board wird vorbereitet...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '1rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Dein Bingo-Board</h1>
        <button onClick={generateNewBoard} className="btn" style={{ padding: '0.5rem 1rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <RefreshCw size={18} />
        </button>
      </div>

      {hasBingo && (
        <div className="card animate-fade" style={{ background: 'var(--success)', marginBottom: '2rem', textAlign: 'center', color: '#fff' }}>
          <Trophy size={48} style={{ margin: '0 auto 1rem' }} />
          <h2>BINGO! Herzlichen Glückwunsch!</h2>
          <p>Deine Kollegen wurden benachrichtigt.</p>
        </div>
      )}

      <div className="bingo-grid">
        {board.length < 25 ? (
          <div className="card" style={{ gridColumn: 'span 5', textAlign: 'center' }}>
            <p>Nicht genügend Sprüche für ein 5x5 Board vorhanden ({board.length}/25).</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Bitte reiche mehr Vorschläge ein oder warte auf Freigaben!
            </p>
          </div>
        ) : (
          board.map((entry, idx) => (
            <div 
              key={idx} 
              className={`bingo-tile ${marked[idx] ? 'marked' : ''}`}
              onClick={() => toggleTile(idx)}
            >
              {entry.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
