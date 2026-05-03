'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load departments
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => setDepartments(data))
      .catch(err => console.error('Error fetching departments:', err));

    // Load user settings
    const savedName = localStorage.getItem('bingo_user_name');
    const savedDept = localStorage.getItem('bingo_user_dept');
    if (savedName) setName(savedName);
    if (savedDept) setDepartmentId(savedDept);
  }, []);

  const handleSave = () => {
    localStorage.setItem('bingo_user_name', name);
    localStorage.setItem('bingo_user_dept', departmentId);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Deine Einstellungen</h1>
      
      <div className="card">
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Dein Name</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="z.B. Sandra"
        />

        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>Deine Abteilung</label>
        <select 
          value={departmentId} 
          onChange={(e) => setDepartmentId(e.target.value)}
        >
          <option value="">-- Abteilung wählen --</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>

        <button 
          className="btn" 
          onClick={handleSave}
          style={{ width: '100%', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <Save size={20} />
          {saved ? 'Gespeichert!' : 'Einstellungen speichern'}
        </button>
      </div>
    </div>
  );
}
