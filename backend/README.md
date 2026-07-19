# Construction Expense Management System — Backend

Node.js + Express + MongoDB (Mongoose) REST API for tracking construction
project budgets and expenses. The API is open (no authentication) by
design — this is a single-tenant, internal tool.

## What's included

- **Projects**: full CRUD, optional engineer assignment, budget fields
  (spent, remaining, utilization %) computed live via aggregation — never
  stored redundantly, so they can't drift out of sync
- **Expenses**: CRUD, optional bill image upload (Multer), each expense
  records who created it (`createdByName`), a reason, a price, and a date
- **Budget notifications**: auto-fires at 80% and 100%+ budget
  utilization, and when a project is marked completed
- **Users**: a lightweight staff directory (name/email/role) used to
  populate the "Assigned Engineer" and "Created By" pickers in the
  frontend — not gated behind any admin role
- **Reports**: detailed monthly breakdown (totals, averages, % of year,
  peak month) plus a spend-by-engineer breakdown, project-wise report,
  and **Excel**/**PDF** export per project
- **Dashboard**: summary cards + chart data (monthly trend, budget vs.
  expense per project)
- **Security**: Helmet, CORS, centralized error handler, input
  validation (express-validator)

## Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI to your MongoDB connection string
npm run dev     # auto-restart on changes
# or
npm start       # production
```

Server runs on `http://localhost:5000` by default. Health check: `GET /api/health`.

## API overview

| Method | Endpoint | Notes |
|---|---|---|
| GET/POST | `/api/projects` | list / create |
| GET/PUT/DELETE | `/api/projects/:id` | |
| GET | `/api/expenses/project/:projectId` | paginated, date-filterable |
| POST/PUT/DELETE | `/api/expenses` `/api/expenses/:id` | multipart for bill image |
| GET/POST/PUT/DELETE | `/api/users` | staff directory |
| GET | `/api/reports/monthly?year=&project=` | detailed monthly + by-engineer breakdown |
| GET | `/api/reports/project/:id` | full project report |
| GET | `/api/reports/project/:id/export/excel` \| `/pdf` | file download |
| GET | `/api/dashboard/summary` \| `/charts` | |
| GET/PUT | `/api/notifications` \| `/api/notifications/:id/read` | global feed |

## Design notes

- **Budget numbers are never stored redundantly on the Project document.**
  They're computed live via MongoDB aggregation over the Expenses
  collection, so there's no risk of a stored total drifting from reality
  after edits/deletes.
- Deleting a project with linked expenses is blocked — expenses must be
  removed first (prevents orphaned records).
- There is no authentication layer. If this ever needs to be exposed
  beyond a trusted internal network, add auth in front of it rather than
  assuming the API itself is a security boundary.
