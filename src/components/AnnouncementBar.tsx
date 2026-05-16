'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Announcement {
  active: boolean;
  color: string;
  headline: string;
  emoji: string;
  infoText: string;
}

export default function AnnouncementBar({ announcement }: { announcement: Announcement }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!announcement || !announcement.active) {
      setIsVisible(false);
      return;
    }
    const hash = `${announcement.headline}-${announcement.infoText}`;
    const closedHash = localStorage.getItem('closed_announcement');
    if (closedHash !== hash) {
      setIsVisible(true);
    }
  }, [announcement]);

  if (!isVisible || !announcement || !announcement.active) return null;

  const close = () => {
    const hash = `${announcement.headline}-${announcement.infoText}`;
    localStorage.setItem('closed_announcement', hash);
    setIsVisible(false);
  };

  return (
    <div style={{
      backgroundColor: announcement.color || '#3b82f6',
      color: '#ffffff',
      padding: '0.75rem 1rem',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '1rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
        {announcement.emoji && <span style={{ fontSize: '1.5rem' }}>{announcement.emoji}</span>}
        <div>
          <h4 style={{ margin: 0, fontWeight: 'bold', fontSize: '1rem' }}>{announcement.headline}</h4>
          {announcement.infoText && <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>{announcement.infoText}</p>}
        </div>
      </div>
      <button onClick={close} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8, marginTop: '0.2rem', padding: '0.2rem' }}>
        <X size={20} />
      </button>
    </div>
  );
}
