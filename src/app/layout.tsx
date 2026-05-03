import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, PenTool, Vote, Settings, ShieldCheck } from "lucide-react";
import BingoNotifier from "@/components/BingoNotifier";

export const metadata: Metadata = {
  title: "Büro-Bingo",
  description: "Das vernetzte Bingo-Erlebnis für den Arbeitsplatz.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <nav className="nav">
          <Link href="/" className="nav-link" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent)' }}>
            Büro-Bingo
          </Link>
          <div className="nav-links">
            <Link href="/play" className="nav-link">
              <LayoutDashboard size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              Spielen
            </Link>
            <Link href="/suggest" className="nav-link">
              <PenTool size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              Vorschlagen
            </Link>
            <Link href="/vote" className="nav-link">
              <Vote size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              Voten
            </Link>
            <Link href="/settings" className="nav-link">
              <Settings size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              Setup
            </Link>
            <Link href="/admin" className="nav-link">
              <ShieldCheck size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              Admin
            </Link>
          </div>
        </nav>
        <main className="container animate-fade">
          {children}
        </main>
        <BingoNotifier />
      </body>
    </html>
  );
}
