'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

interface Entry {
  id: string;
  text: string;
  author_name: string;
  department_ids: string[];
}

interface Department {
  id: string;
  name: string;
}

type VoteState = 'up' | 'down' | null;

export default function VotePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [myVotes, setMyVotes] = useState<Record<string, VoteState>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string>('all');

  useEffect(() => {
    const savedVotes: Record<string, VoteState> = JSON.parse(localStorage.getItem('bingo_my_votes_v2') || '{}');
    setMyVotes(savedVotes);

    Promise.all([
      fetch('/api/entries').then(r => r.json()),
      fetch('/api/departments').then(r => r.json()),
    ]).then(([entriesData, deptsData]) => {
      setEntries(entriesData);
      setDepartments(deptsData);
      setLoading(false);
    });
  }, []);

  const handleVote = async (entryId: string, type: 'up' | 'down') => {
    const existing = myVotes[entryId];
    
    // Toggle off if same vote type clicked again
    if (existing === type) return;

    const userId = localStorage.getItem('bingo_user_id') || (() => {
      const id = Math.random().toString(36).substring(7);
      localStorage.setItem('bingo_user_id', id);
      return id;
    })();

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, userId, type })
      });

      if (res.ok) {
        const newVotes = { ...myVotes, [entryId]: type };
        setMyVotes(newVotes);
        localStorage.setItem('bingo_my_votes_v2', JSON.stringify(newVotes));
      }
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const deptMap = Object.fromEntries(departments.map(d => [d.id, d.name]));

  const filteredEntries = selectedDept === 'all'
    ? entries
    : entries.filter(e => e.department_ids?.includes(selectedDept));

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Lade Vorschläge...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Abstimmen</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Welche dieser Sprüche sollten ins Spiel? Daumen rauf oder runter!
      </p>

      {/* Department filter */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <button
          onClick={() => setSelectedDept('all')}
          className="btn"
          style={{
            background: selectedDept === 'all' ? 'var(--accent)' : 'var(--bg-card)',
            color: selectedDept === 'all' ? 'white' : 'var(--text-secondary)',
            padding: '0.4rem 1rem',
            border: '1px solid var(--border)',
          }}
        >
          Alle
        </button>
        {departments.map(dept => (
          <button
            key={dept.id}
            onClick={() => setSelectedDept(dept.id)}
            className="btn"
            style={{
              background: selectedDept === dept.id ? 'var(--accent)' : 'var(--bg-card)',
              color: selectedDept === dept.id ? 'white' : 'var(--text-secondary)',
              padding: '0.4rem 1rem',
              border: '1px solid var(--border)',
            }}
          >
            {dept.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredEntries.length === 0 ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <MessageSquare size={40} color="var(--text-secondary)" style={{ margin: '0 auto 1rem' }} />
            <p>Aktuell gibt es keine Vorschläge für diese Abteilung.</p>
          </div>
        ) : (
          filteredEntries.map(entry => {
            const vote = myVotes[entry.id];
            const deptNames = (entry.department_ids || []).map(id => deptMap[id]).filter(Boolean);

            return (
              <div key={entry.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '0.5rem' }}>"{entry.text}"</p>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                    <span>Von: {entry.author_name}</span>
                    {deptNames.length > 0 && (
                      <>
                        <span>•</span>
                        {deptNames.map(name => (
                          <span
                            key={name}
                            style={{
                              background: 'rgba(255,255,255,0.08)',
                              padding: '0.1rem 0.5rem',
                              borderRadius: '10px',
                            }}
                          >
                            {name}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleVote(entry.id, 'up')}
                    disabled={vote === 'up'}
                    title="Dafür"
                    style={{
                      background: vote === 'up' ? 'var(--success)' : 'transparent',
                      border: `1px solid ${vote === 'up' ? 'var(--success)' : 'var(--border)'}`,
                      color: vote === 'up' ? '#fff' : 'var(--text-secondary)',
                      borderRadius: '8px',
                      padding: '0.5rem 0.8rem',
                      cursor: vote === 'up' ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'var(--transition)',
                    }}
                  >
                    <ThumbsUp size={18} />
                  </button>

                  <button
                    onClick={() => handleVote(entry.id, 'down')}
                    disabled={vote === 'down'}
                    title="Dagegen"
                    style={{
                      background: vote === 'down' ? '#ef4444' : 'transparent',
                      border: `1px solid ${vote === 'down' ? '#ef4444' : 'var(--border)'}`,
                      color: vote === 'down' ? '#fff' : 'var(--text-secondary)',
                      borderRadius: '8px',
                      padding: '0.5rem 0.8rem',
                      cursor: vote === 'down' ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'var(--transition)',
                    }}
                  >
                    <ThumbsDown size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
