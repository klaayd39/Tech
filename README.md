# 📡 Bombo Radyo — Equipment Maintenance Tracker

A dark-themed equipment maintenance dashboard built for the IT/Technician at Bombo Radyo Malaybalay. Track transmitters, mixers, studio gear, and more — with full maintenance log history.

**Stack:** React + Vite · Supabase (Auth + PostgreSQL) · Vercel

---

## Features

- **Equipment inventory** — add, edit, delete gear with category, location, serial number, status
- **Signal meter UI** — broadcast-style bar indicator for operational / maintenance / faulty / decommissioned
- **Maintenance logs** — log entries per equipment with technician name, parts replaced, and cost in ₱
- **Overdue alerts** — banner warning for equipment past scheduled maintenance date
- **Search & filter** — filter by status, search by name / category / location / serial
- **Auth** — Supabase email/password login

---

## Setup

### 1. Supabase
1. Create a project at supabase.com (or use your existing one)
2. In SQL Editor, paste and run `supabase-schema.sql`
3. Copy your Project URL and anon key from Settings → API

### 2. Local dev
```bash
npm install
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

### 3. Deploy to Vercel
1. Push to GitHub
2. Import repo on vercel.com
3. Add env vars: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
4. Deploy — Vercel auto-detects Vite

---

## Supabase Auth
- Go to Authentication → Providers → ensure Email is enabled
- Optionally disable "Confirm email" for instant login without verification

---

## Status levels

| Status | Signal bars | Meaning |
|--------|-------------|---------|
| Operational | 4 bars (green) | Working normally |
| Maintenance | 2 bars (yellow) | Under scheduled service |
| Faulty | 1 bar (red) | Broken / needs repair |
| Decommissioned | 0 bars (gray) | No longer in use |

---

## Project structure
```
src/
├── supabaseClient.js     # Supabase client
├── App.jsx               # Auth state
├── AuthPage.jsx          # Sign in / sign up
├── Dashboard.jsx         # Equipment list, filters, summary
├── EquipmentModal.jsx    # Add / edit form
├── EquipmentDetail.jsx   # Detail + maintenance logs
├── LogModal.jsx          # Add log entry
├── SignalMeter.jsx       # Broadcast signal bar indicator
└── index.css             # Dark theme + CSS variables
```
