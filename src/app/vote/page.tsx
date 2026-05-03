'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, MessageSquare } from 'lucide-react';

interface Entry {
  id: string;
  text: string;
  author_name: string;
  department_ids: string[];
}

export default function VotePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/entries')
      .then(res => res.json())
      .then(data => {
        setEntries(data);
        setLoading(false);
      });
    
    // Load local votes to prevent UI flicker
    const savedVotes = JSON.parse(localStorage.getItem('bingo_my_votes') || '[]');
    setVotedIds(savedVotes);
  }, []);

  const handleVote = async (entryId: string) => {
    const userId = localStorage.getItem('bingo_user_id') || Math.random().toString(36).substring(7);
    if (!localStorage.getItem('bingo_user_id')) localStorage.setItem('bingo_user_id', userId);

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, userId, type: 'up' })
      });

      if (res.ok) {
        const newVoted = [...votedIds, entryId];
        setVotedIds(newVoted);
        localStorage.setItem('bingo_my_votes', JSON.stringify(newVoted));
        // Optionally remove from list or show as voted
      }
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Lade Vorschläge...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Abstimmen</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Welche dieser Sprüche sollten ins Spiel? Ein Klick auf den Daumen genügt!
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {entries.length === 0 ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <MessageSquare size={40} color="var(--text-secondary)" style={{ margin: '0 auto 1rem' }} />
            <p>Aktuell gibt es keine neuen Vorschläge. Sei der Erste!</p>
          </div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '0.5rem' }}>"{entry.text}"</p>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Von: {entry.author_name}</span>
                  {entry.department_ids.length > 0 && <span>• {entry.department_ids.length} Abteilungen</span>}
                </div>
              </div>
              
              <button 
                onClick={() => handleVote(entry.id)}
                disabled={votedIds.includes(entry.id)}
                className="btn"
                style={{ 
                  backgroundColor: votedIds.includes(entry.id) ? 'var(--success)' : 'var(--bg-main)',
                  color: votedIds.includes(entry.id) ? '#fff' : 'var(--accent)',
                  border: votedIds.includes(entry.id) ? 'none' : '1px solid var(--accent)',
                  padding: '0.5rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <ThumbsUp size={18} />
                {votedIds.includes(entry.id) ? 'Gevotet' : 'Vote'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
