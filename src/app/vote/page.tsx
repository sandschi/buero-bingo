'use client';

import { useState, useEffect, useCallback } from 'react';
import { ThumbsDown, MessageSquare } from 'lucide-react';

interface Entry {
  id: string;
  text: string;
  author_name: string;
  department_ids: string[];
  deptVotes: Record<string, number>;
  downvotes: number;
  userDeptVotes: string[];
  userDownvoted: boolean;
}

interface Department {
  id: string;
  name: string;
}

export default function VotePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const getUserId = () => {
    let id = localStorage.getItem('bingo_user_id');
    // Validate it's a proper UUID (36 chars with dashes); regenerate if not
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      id = crypto.randomUUID();
      localStorage.setItem('bingo_user_id', id);
    }
    return id;
  };

  const loadData = useCallback(async () => {
    const userId = getUserId();
    const [entriesRes, deptsRes] = await Promise.all([
      fetch(`/api/entries?userId=${userId}`),
      fetch('/api/departments'),
    ]);
    setEntries(await entriesRes.json());
    setDepartments(await deptsRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDeptVote = async (entryId: string, departmentId: string) => {
    const userId = getUserId();
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId, userId, type: 'dept', departmentId }),
    });
    if (res.ok) {
      // Optimistic update
      setEntries(prev => prev.map(e => {
        if (e.id !== entryId) return e;
        return {
          ...e,
          userDeptVotes: [...e.userDeptVotes, departmentId],
          deptVotes: {
            ...e.deptVotes,
            [departmentId]: (e.deptVotes[departmentId] || 0) + 1,
          },
        };
      }));
    }
  };

  const handleDownvote = async (entryId: string) => {
    const userId = getUserId();
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId, userId, type: 'down' }),
    });
    if (res.ok) {
      setEntries(prev => prev.map(e =>
        e.id === entryId ? { ...e, userDownvoted: true, downvotes: e.downvotes + 1 } : e
      ));
    }
  };

  const filteredEntries = selectedDept === 'all'
    ? entries
    : entries.filter(e =>
        // Show entries that have any dept votes for this dept OR no dept-specific votes yet
        Object.keys(e.deptVotes).includes(selectedDept) || Object.keys(e.deptVotes).length === 0
      );

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Lade Vorschläge...</div>;

  return (
    <div style={{ maxWidth: '860px', margin: '2rem auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Abstimmen</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Stimme ab, für welche Abteilung ein Spruch relevant ist — oder lehne ihn ab.
      </p>

      {/* Department filter */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {[{ id: 'all', name: 'Alle' }, ...departments].map(dept => (
          <button
            key={dept.id}
            onClick={() => setSelectedDept(dept.id)}
            className="btn"
            style={{
              background: selectedDept === dept.id ? 'var(--accent)' : 'var(--bg-card)',
              color: selectedDept === dept.id ? 'white' : 'var(--text-secondary)',
              padding: '0.35rem 1rem',
              fontSize: '0.85rem',
              border: '1px solid var(--border)',
            }}
          >
            {dept.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {filteredEntries.length === 0 ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <MessageSquare size={40} color="var(--text-secondary)" style={{ margin: '0 auto 1rem' }} />
            <p>Keine Vorschläge zum Abstimmen.</p>
          </div>
        ) : (
          filteredEntries.map(entry => (
            <div key={entry.id} className="card">
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.3rem' }}>"{entry.text}"</p>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Von: {entry.author_name}</span>
                </div>
                <button
                  onClick={() => !entry.userDownvoted && handleDownvote(entry.id)}
                  disabled={entry.userDownvoted}
                  title="Ablehnen"
                  style={{
                    background: entry.userDownvoted ? '#ef4444' : 'transparent',
                    border: `1px solid ${entry.userDownvoted ? '#ef4444' : 'var(--border)'}`,
                    color: entry.userDownvoted ? '#fff' : '#ef4444',
                    borderRadius: '8px',
                    padding: '0.4rem 0.7rem',
                    cursor: entry.userDownvoted ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.8rem',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'var(--transition)',
                  }}
                >
                  <ThumbsDown size={15} />
                  {entry.downvotes > 0 && <span>{entry.downvotes}</span>}
                </button>
              </div>

              {/* Department vote buttons */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.8rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                  Relevant für:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {departments.map(dept => {
                    const voted = entry.userDeptVotes.includes(dept.id);
                    const count = entry.deptVotes[dept.id] || 0;
                    return (
                      <button
                        key={dept.id}
                        onClick={() => !voted && handleDeptVote(entry.id, dept.id)}
                        disabled={voted || entry.userDownvoted}
                        style={{
                          background: voted ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${voted ? 'var(--accent)' : 'var(--border)'}`,
                          color: voted ? '#fff' : 'var(--text-secondary)',
                          borderRadius: '20px',
                          padding: '0.3rem 0.8rem',
                          fontSize: '0.8rem',
                          cursor: (voted || entry.userDownvoted) ? 'default' : 'pointer',
                          transition: 'var(--transition)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          opacity: entry.userDownvoted && !voted ? 0.4 : 1,
                        }}
                      >
                        {dept.name}
                        {count > 0 && (
                          <span style={{
                            background: voted ? 'rgba(255,255,255,0.25)' : 'var(--accent)',
                            color: '#fff',
                            borderRadius: '10px',
                            padding: '0 0.4rem',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                          }}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
