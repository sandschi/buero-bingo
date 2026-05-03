'use client';

import { useState, useCallback } from 'react';
import { Check, X, Trash2, Lock, Plus, Pencil, Save } from 'lucide-react';

interface Entry {
  id: string;
  text: string;
  status: string;
  author_name: string;
  downvotes: number;
  department_ids: string[];
  dept_vote_counts: { dept_id: string; dept_name: string; count: number }[];
}

interface Department {
  id: string;
  name: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState('');
  const [threshold, setThreshold] = useState<string>('5');
  const [activeTab, setActiveTab] = useState<'entries' | 'departments'>('entries');
  const [newDeptName, setNewDeptName] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editDeptIds, setEditDeptIds] = useState<string[]>([]);

  const adminFetch = useCallback(async (action: string, extra: Record<string, unknown> = {}) => {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, action, ...extra }),
    });
    return res;
  }, [password]);

  const fetchAllData = useCallback(async () => {
    const [resEntries, resDepts, resSettings] = await Promise.all([
      adminFetch('get_all'),
      adminFetch('get_departments'),
      adminFetch('get_settings'),
    ]);

    if (resEntries.ok && resDepts.ok && resSettings.ok) {
      setEntries(await resEntries.json());
      setDepartments(await resDepts.json());
      const settingsData = await resSettings.json();
      const autoApprove = settingsData.find((s: any) => s.key === 'auto_approve_threshold');
      if (autoApprove) setThreshold(autoApprove.value);
      setIsAuthorized(true);
      setError('');
    } else {
      setError('Falsches Passwort');
    }
  }, [adminFetch]);

  const handleLogin = async () => { await fetchAllData(); };

  const updateStatus = async (entryId: string, status: string) => {
    await adminFetch('update_status', { entryId, status });
    await fetchAllData();
  };

  const deleteEntry = async (entryId: string) => {
    if (!confirm('Wirklich löschen?')) return;
    await adminFetch('delete', { entryId });
    await fetchAllData();
  };

  const startEdit = (entry: Entry) => {
    setEditingId(entry.id);
    setEditText(entry.text);
    setEditDeptIds(entry.department_ids || []);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await adminFetch('update_entry', { entryId: editingId, editText, editDepartmentIds: editDeptIds });
    setEditingId(null);
    await fetchAllData();
  };

  const cancelEdit = () => setEditingId(null);

  const toggleEditDept = (id: string) =>
    setEditDeptIds(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);

  const updateThreshold = async () => {
    await adminFetch('update_settings', { settingsKey: 'auto_approve_threshold', settingsValue: threshold });
    alert('Gespeichert');
  };

  const addDepartment = async () => {
    if (!newDeptName.trim()) return;
    await adminFetch('add_department', { departmentName: newDeptName.trim() });
    setNewDeptName('');
    await fetchAllData();
  };

  const deleteDepartment = async (departmentId: string) => {
    if (!confirm('Abteilung löschen?')) return;
    await adminFetch('delete_department', { departmentId });
    await fetchAllData();
  };

  const deptMap = Object.fromEntries(departments.map(d => [d.id, d.name]));

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
    <div style={{ maxWidth: '1100px', margin: '2rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Admin Dashboard</h1>
        <button className="btn" onClick={() => setIsAuthorized(false)} style={{ background: 'var(--bg-card)' }}>Logout</button>
      </div>

      {/* Settings */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Einstellungen</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label>Automatisches Freigeben ab x Votes pro Abteilung:</label>
          <input type="number" min="1" value={threshold} onChange={(e) => setThreshold(e.target.value)} style={{ width: '80px', marginBottom: 0 }} />
          <button className="btn" onClick={updateThreshold}>Speichern</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        {(['entries', 'departments'] as const).map(tab => (
          <button key={tab} className="btn" onClick={() => setActiveTab(tab)} style={{
            background: activeTab === tab ? 'var(--accent)' : 'var(--bg-card)',
            color: activeTab === tab ? 'white' : 'var(--text-secondary)',
          }}>
            {tab === 'entries' ? `Einträge (${entries.length})` : `Abteilungen (${departments.length})`}
          </button>
        ))}
      </div>

      {/* Entries tab */}
      {activeTab === 'entries' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Text</th>
                <th style={{ padding: '1rem' }}>Autor</th>
                <th style={{ padding: '1rem' }}>Abteilungen</th>
                <th style={{ padding: '1rem' }}>Votes</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <>
                  <tr key={entry.id} style={{ borderBottom: editingId === entry.id ? 'none' : '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', maxWidth: '260px' }}>{entry.text}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{entry.author_name}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {(entry.department_ids || []).map(id => (
                          <span key={id} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', padding: '0.1rem 0.5rem', borderRadius: '10px' }}>
                            {deptMap[id] || id}
                          </span>
                        ))}
                        {(entry.department_ids || []).length === 0 && <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>–</span>}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        {(entry.dept_vote_counts || []).map(dv => (
                          <span key={dv.dept_id} style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            <span style={{ color: 'var(--accent)', fontWeight: '600' }}>{dv.count}×</span>{' '}
                            <span style={{ color: 'var(--text-secondary)' }}>{dv.dept_name}</span>
                          </span>
                        ))}
                        {(entry.downvotes || 0) > 0 && (
                          <span style={{ fontSize: '0.75rem', color: '#ef4444', whiteSpace: 'nowrap' }}>↓ {entry.downvotes} Ablehnung{entry.downvotes !== 1 ? 'en' : ''}</span>
                        )}
                        {(!entry.dept_vote_counts?.length && !entry.downvotes) && (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>–</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem',
                        background: entry.status === 'approved' ? 'var(--success)' : entry.status === 'pending' ? 'orange' : 'red'
                      }}>
                        {entry.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => startEdit(entry)} title="Bearbeiten" style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}><Pencil size={18} /></button>
                        {entry.status !== 'approved' && (
                          <button onClick={() => updateStatus(entry.id, 'approved')} title="Genehmigen" style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer' }}><Check size={18} /></button>
                        )}
                        {entry.status !== 'rejected' && (
                          <button onClick={() => updateStatus(entry.id, 'rejected')} title="Ablehnen" style={{ background: 'none', border: 'none', color: 'orange', cursor: 'pointer' }}><X size={18} /></button>
                        )}
                        <button onClick={() => deleteEntry(entry.id)} title="Löschen" style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>

                  {/* Inline edit row */}
                  {editingId === entry.id && (
                    <tr key={`edit-${entry.id}`} style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)' }}>
                      <td colSpan={6} style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                          <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Text</label>
                            <textarea
                              value={editText}
                              onChange={e => setEditText(e.target.value)}
                              rows={2}
                              style={{ width: '100%', resize: 'vertical', marginBottom: 0 }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Abteilungen</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                              {departments.map(dept => (
                                <button
                                  key={dept.id}
                                  onClick={() => toggleEditDept(dept.id)}
                                  style={{
                                    background: editDeptIds.includes(dept.id) ? 'var(--accent)' : 'transparent',
                                    border: `1px solid ${editDeptIds.includes(dept.id) ? 'var(--accent)' : 'var(--border)'}`,
                                    color: editDeptIds.includes(dept.id) ? '#fff' : 'var(--text-secondary)',
                                    borderRadius: '20px',
                                    padding: '0.25rem 0.8rem',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    transition: 'var(--transition)',
                                  }}
                                >
                                  {dept.name}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn" onClick={saveEdit} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Save size={16} /> Speichern</button>
                            <button className="btn" onClick={cancelEdit} style={{ background: 'var(--bg-card)' }}>Abbrechen</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Keine Einträge</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Departments tab */}
      {activeTab === 'departments' && (
        <div className="card">
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <input
              type="text"
              placeholder="Neue Abteilung..."
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addDepartment()}
              style={{ marginBottom: 0, flex: 1 }}
            />
            <button className="btn" onClick={addDepartment} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Plus size={18} /> Hinzufügen
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem', width: '100px' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => (
                <tr key={dept.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>{dept.name}</td>
                  <td style={{ padding: '1rem' }}>
                    <button onClick={() => deleteDepartment(dept.id)} title="Löschen" style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan={2} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Keine Abteilungen</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
