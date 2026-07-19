# Construction Expense Management System

Tracks construction project budgets and expenses: create a project, log
expenses against it (with who logged it, why, how much, and an optional
bill photo), and see budget usage roll up live on a dashboard and in
detailed monthly reports.

A single-tenant internal tool — no login, no user roles in the UI.

```
.
├── backend/   Node.js + Express + MongoDB REST API   (see backend/README.md)
└── frontend/  Angular 18 + Angular Material SPA        (see frontend/README.md)
```

## Quick start

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env      # set MONGO_URI to your MongoDB connection string
npm run dev                # http://localhost:5000

# 2. Frontend (separate terminal)
cd frontend
npm install
npm start                  # http://localhost:4200
```

Both apps need to be running for the UI to work — the frontend calls the
backend at `http://localhost:5000/api` by default (configurable in
`frontend/src/environments/environment.ts`).

See each app's own README for the full feature list, API reference, and
architecture notes.
