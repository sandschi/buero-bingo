import Link from "next/link";
import { Play } from "lucide-react";

export default function Home() {
  return (
    <div style={{ textAlign: 'center', maxWidth: '800px', margin: '4rem auto' }}>
      <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', background: 'linear-gradient(to right, #fff, var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Büro-Bingo
      </h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
        Der langweilige Meeting-Alltag war gestern. Verwandle Phrasen und Pannen in ein gemeinsames Spielerlebnis mit deinen Kollegen.
      </p>

      <div className="card" style={{ textAlign: 'left', marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>So funktioniert es:</h2>
        <ul style={{ listStyle: 'none', lineHeight: '2' }}>
          <li>🚀 <strong>Wähle dein Team:</strong> In den Einstellungen legst du deine Abteilung fest.</li>
          <li>🎯 <strong>Fülle dein Board:</strong> Dein Board wird mit Sprüchen gefüllt, die zu deinem Job passen.</li>
          <li>🤝 <strong>Echtzeit-Action:</strong> Wenn du ein Bingo hast, erfahren es alle sofort!</li>
          <li>💡 <strong>Gestalte mit:</strong> Schlage eigene Sprüche vor und vote über andere.</li>
        </ul>
      </div>

      <Link href="/play">
        <button className="btn" style={{ fontSize: '1.2rem', padding: '1rem 2.5rem', display: 'flex', alignItems: 'center', margin: '0 auto', gap: '0.75rem' }}>
          <Play size={24} />
          Jetzt Spielen
        </button>
      </Link>
    </div>
  );
}
