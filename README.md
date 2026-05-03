# 🚀 Büro-Bingo

Ein modernes, vernetztes Bingo-Erlebnis für das Büro. Schlage Sprüche vor, vote über die Einreichungen deiner Kollegen und sei der Erste, der "BINGO!" ruft.

## ✨ Features

- **Echtzeit-Meldungen**: Sobald ein Spieler ein Bingo hat, werden alle anderen Teilnehmer sofort benachrichtigt.
- **Abteilungs-Filter**: Das Bingo-Board passt sich deiner Abteilung an (IT, Sales, HR, etc.).
- **Suggestion System**: Reiche eigene Sprüche ein, die du im Büro-Alltag hörst.
- **Voting System**: Die Community entscheidet! Genügend Votes führen zur automatischen Freigabe eines Spruchs.
- **Admin Dashboard**: Volle Kontrolle über alle Einträge und Einstellungen.
- **Premium Design**: Sleeker Dark-Mode mit Glassmorphism-Effekten.

## 🛠️ Tech-Stack

- **Frontend/Backend**: [Next.js 15](https://nextjs.org/) (App Router)
- **Real-time**: [Socket.io](https://socket.io/)
- **Datenbank**: PostgreSQL
- **Deployment**: Optimiert für [Dokploy](https://dokploy.com/) (Self-hosted)

## 🚀 Deployment auf Dokploy

Dieses Projekt ist für das Deployment als Docker-Container auf Dokploy vorbereitet.

1.  **Repository spiegeln**: Verbinde dein Dokploy mit diesem GitHub-Repo.
2.  **Datenbank**: Erstelle einen PostgreSQL-Service in Dokploy.
3.  **Umgebungsvariablen**: Setze folgende Variablen in deinem Dokploy App-Service:
    - `DATABASE_URL`: Der PostgreSQL Connection-String.
    - `ADMIN_PASSWORD`: Dein Passwort für den `/admin` Bereich.
4.  **Deploy**: Dokploy erkennt das `Dockerfile` automatisch und baut das Image.

## 💻 Lokale Entwicklung

1.  Repository klonen.
2.  `npm install` ausführen.
3.  Umgebungsvariablen in einer `.env.local` Datei setzen.
4.  `npm run dev` (für Next.js Dev-Modus) oder `node server.js` (für Real-time Tests) ausführen.

---
Erstellt mit ❤️ für produktive (oder weniger produktive) Office-Stunden.
