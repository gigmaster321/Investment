# Quantum Investments

An investment platform web app with a public landing page, user dashboard, and admin panel.

## Architecture

- **Frontend**: `artifacts/quantum-investments/` — Vite + React + Tailwind CSS v4, wouter routing
- **API Server**: `artifacts/api-server/` — Express (scaffold, no custom routes yet)
- **Shared libs**: `lib/api-client-react/`, `lib/api-spec/`, `lib/db/`

## Design

Deep navy theme (`--background: 224 70% 10%`), primary blue (`--primary: 215 82% 46%`), Inter + Plus Jakarta Sans fonts. Assets in `attached_assets/`.

## Key routes

- `/` — Landing page (home, plans, about, FAQ, contact)
- `/login`, `/register` — Auth pages
- `/dashboard` — User dashboard (investments, deposits, withdrawals, transactions, earnings, referral, notifications, profile)
- `/admin/login`, `/admin` — Admin panel (users, withdrawals, plans, analytics, settings)

## User preferences

- Port existing app as-is; visual and functional parity is the priority.
