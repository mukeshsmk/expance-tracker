# Construction Expense Management System — Frontend

Angular 18 (standalone components, lazy-loaded routes) + Angular Material
+ Chart.js, built against the backend REST API in `../backend`.

## What's included

- **Dashboard**: summary cards (projects, estimated cost, invested
  amount, expenses, remaining budget, active/completed counts), animated
  count-up on load, monthly trend line chart, budget-vs-expense bar chart
- **Projects**: card-grid list with search/status filter, create/edit
  dialog, delete with confirmation, per-project budget bar with
  80%/100% color states
- **Project detail**: full budget summary, exceeded/warning banners,
  Excel & PDF export, embedded expense table with pagination and
  running total
- **Expenses**: add/edit dialog with exactly the fields that matter —
  who created it, date, reason, price, and an optional bill image
- **Reports**: detailed year/month breakdown (totals, transaction
  counts, averages, % of year, peak month) plus a spend-by-engineer
  breakdown, and quick links into each project's report
- **Settings**: dark/light mode toggle (persisted)
- **Mobile**: off-canvas nav drawer with auto-close on navigation,
  dialogs that fit any phone width, tables that scroll horizontally
  instead of breaking layout
- **Motion**: route fade transitions, staggered card entrance
  animations, hover lift on cards — respects `prefers-reduced-motion`
- **Design system**: custom "site blueprint" identity — deep navy +
  safety amber palette, IBM Plex Sans/Mono typography, CSS custom
  properties for full dark-mode support

There is no login screen and no user roles in the UI — this is a
single-tenant internal tool that talks to an open API. The "Users" list
still exists server-side purely to populate the "Assigned Engineer" and
"Created By" pickers.

## Setup

```bash
cd frontend
npm install
```

Set the API URL in `src/environments/environment.ts` (defaults to
`http://localhost:5000/api`, matching the backend).

```bash
npm start        # dev server on http://localhost:4200
npm run build    # production build → dist/frontend
```

## Architecture notes

- **Standalone components + `loadComponent` lazy routes** (Angular 18
  idiomatic pattern) instead of NgModules — every feature route is its
  own lazy chunk.
- **Signals** for local component state (loading flags, lists, computed
  budget totals) instead of manual `BehaviorSubject` plumbing.
- **Reactive Forms** everywhere, with `FormBuilder` injected via
  `inject()` at the field-initializer level.
- File exports (Excel/PDF) go through `HttpClient` with
  `responseType: 'blob'`.
- Route transitions are driven by a single `routeAnimations` trigger in
  `core/animations/route-animations.ts`, wired once in
  `main-layout.component`, rather than per-page animation code.
