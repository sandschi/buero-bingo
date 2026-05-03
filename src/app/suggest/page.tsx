'use client';

import { useState, useEffect } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export default function SuggestPage() {
  const [text, setText] = useState('');
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => setDepartments(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const authorName = localStorage.getItem('bingo_user_name') || 'Anonym';

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          departmentIds: selectedDepts,
          authorName
        })
      });

      if (res.ok) {
        setSuccess(true);
        setText('');
        setSelectedDepts([]);
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Error submitting suggestion:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDept = (id: string) => {
    setSelectedDepts(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Neuen Spruch vorschlagen</h1>
      
      {success ? (
        <div className="card animate-fade" style={{ textAlign: 'center', borderColor: 'var(--success)' }}>
          <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
          <h3>Erfolgreich eingereicht!</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Dein Vorschlag wird nun von der Community bewertet.
          </p>
          <button className="btn" onClick={() => setSuccess(false)} style={{ marginTop: '1.5rem' }}>
            Noch einen Vorschlag machen
          </button>
        </div>
      ) : (
        <form className="card" onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Was ist passiert? (z.B. "Kaffeemaschine streikt")
          </label>
          <textarea 
            required
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="Beschreibe das Ereignis..."
            rows={3}
            style={{ resize: 'none' }}
          />

          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
            Für welche Abteilungen ist das relevant?
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
            {departments.map(dept => (
              <div 
                key={dept.id}
                onClick={() => toggleDept(dept.id)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  backgroundColor: selectedDepts.includes(dept.id) ? 'var(--accent)' : 'transparent',
                  color: selectedDepts.includes(dept.id) ? '#fff' : 'var(--text-secondary)',
                  transition: 'var(--transition)'
                }}
              >
                {dept.name}
              </div>
            ))}
            {departments.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Lade Abteilungen...</p>}
          </div>

          <button 
            type="submit" 
            className="btn" 
            disabled={isSubmitting}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Send size={20} />
            {isSubmitting ? 'Wird gesendet...' : 'Vorschlag einreichen'}
          </button>
        </form>
      )}
    </div>
  );
}
