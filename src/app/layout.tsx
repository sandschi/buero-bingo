import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, PenTool, Vote, Settings, ShieldCheck } from "lucide-react";
import BingoNotifier from "@/components/BingoNotifier";
import AnnouncementBar from "@/components/AnnouncementBar";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Büro-Bingo",
  description: "Das vernetzte Bingo-Erlebnis für den Arbeitsplatz.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let announcement = null;
  try {
    const res = await query("SELECT value FROM settings WHERE key = 'announcement'");
    if (res.rows && res.rows.length > 0) {
      announcement = typeof res.rows[0].value === 'string' ? JSON.parse(res.rows[0].value) : res.rows[0].value;
    }
  } catch (err) {
    console.error("Failed to load announcement:", err);
  }

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
        {announcement && announcement.active && <AnnouncementBar announcement={announcement} />}
        <main className="container animate-fade">
          {children}
        </main>
        <BingoNotifier />
      </body>
    </html>
  );
}
