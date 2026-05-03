'use client';

import { useState } from 'react';
import { Check, X, Trash2, Lock } from 'lucide-react';

interface Entry {
  id: string;
  text: string;
  status: string;
  author_name: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState('');

  const [threshold, setThreshold] = useState<string>('5');

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, action: 'get_all' })
      });

      const settingsRes = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, action: 'get_settings' })
      });

      if (res.ok && settingsRes.ok) {
        const data = await res.json();
        const settingsData = await settingsRes.json();
        setEntries(data);
        
        const autoApprove = settingsData.find((s: any) => s.key === 'auto_approve_threshold');
        if (autoApprove) setThreshold(autoApprove.value);

        setIsAuthorized(true);
        setError('');
      } else {
        setError('Falsches Passwort');
      }
    } catch (err) {
      setError('Verbindungsfehler');
    }
  };

  const updateStatus = async (entryId: string, status: string) => {
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, action: 'update_status', entryId, status })
    });
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, action: 'get_all' })
    });
    if (res.ok) setEntries(await res.json());
  };

  const deleteEntry = async (entryId: string) => {
    if (!confirm('Wirklich löschen?')) return;
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, action: 'delete', entryId })
    });
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, action: 'get_all' })
    });
    if (res.ok) setEntries(await res.json());
  };

  const updateThreshold = async () => {
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, action: 'update_settings', settingsKey: 'auto_approve_threshold', settingsValue: threshold })
    });
    alert('Einstellungen gespeichert');
  };

  if (!isAuthorized) {
    return (
      <div style={{ maxWidth: '400px', margin: '6rem auto', textAlign: 'center' }}>
        <div className="card">
          <Lock size={40} style={{ margin: '0 auto 1rem', color: 'var(--accent)' }} />
          <h2>Admin Bereich</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Bitte gib das Admin-Passwort ein.</p>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Passwort..."
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
          <button className="btn" onClick={handleLogin} style={{ width: '100%' }}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1>Admin Dashboard</h1>
        <button className="btn" onClick={() => setIsAuthorized(false)} style={{ background: 'var(--bg-card)' }}>Logout</button>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Einstellungen</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label>Automatisches Freigeben ab x Votes:</label>
          <input type="number" min="1" value={threshold} onChange={(e) => setThreshold(e.target.value)} style={{ width: '80px', marginBottom: 0 }} />
          <button className="btn" onClick={updateThreshold}>Speichern</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
            <tr>
              <th style={{ padding: '1rem' }}>Text</th>
              <th style={{ padding: '1rem' }}>Autor</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => (
              <tr key={entry.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>{entry.text}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{entry.author_name}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '4px', 
                    fontSize: '0.8rem',
                    background: entry.status === 'approved' ? 'var(--success)' : entry.status === 'pending' ? 'orange' : 'red'
                  }}>
                    {entry.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                  {entry.status !== 'approved' && (
                    <button onClick={() => updateStatus(entry.id, 'approved')} title="Genehmigen" style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer' }}><Check size={20}/></button>
                  )}
                  {entry.status !== 'rejected' && (
                    <button onClick={() => updateStatus(entry.id, 'rejected')} title="Ablehnen" style={{ background: 'none', border: 'none', color: 'orange', cursor: 'pointer' }}><X size={20}/></button>
                  )}
                  <button onClick={() => deleteEntry(entry.id)} title="Löschen" style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}><Trash2 size={20}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
