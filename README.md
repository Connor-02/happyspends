# HappySpends 🐷

**Personal Budgeting. Simplified.**

A modern mobile-first Progressive Web App that replaces your budget spreadsheet with a guided, smart budgeting experience.

---

## Features

- **Dashboard** — Overview of income, expenses, bills, savings, debt, budget health score, and smart insights
- **Budget Planner** — Create and manage planned budget categories with planned vs actual tracking
- **Transactions** — Log, search, filter, and manage all transactions
- **Goals** — Track savings goals and debt payoff with contribution history
- **Insights** — Rule-based smart analysis of your spending habits
- **Reports** — Period summary, planned vs actual, category breakdown, and data export

### PWA Capabilities
- Installable on home screen (Android & iOS)
- Offline first — all data stored locally in localStorage
- Lightning fast — fully static build

### Tech Stack
- **Next.js 14** App Router
- **TypeScript** — full type safety
- **Tailwind CSS** — utility-first styling
- **Framer Motion** — smooth animations
- **Recharts** — charts & visualisations
- **next-pwa** — service worker & PWA manifest
- **localStorage** — offline-first storage

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Install & Run

```bash
# Clone or open the project
cd Budget-Smart-PWA

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

On first launch you'll go through a short onboarding to set your:
- Name
- Currency
- Budget period (monthly / weekly)
- Theme (Pink, Blue, Dark, System)

You can optionally **load demo data** to see the app pre-populated with realistic budget entries.

### Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
app/
  page.tsx              # Root redirect (onboarding vs dashboard)
  layout.tsx            # Root layout with providers
  globals.css           # Global styles + Tailwind
  onboarding/page.tsx   # Onboarding wizard
  (app)/
    layout.tsx          # App shell with bottom navigation
    dashboard/          # Home screen
    budget/             # Budget planner
    transactions/       # Transaction log
    goals/              # Goals tracker
    insights/           # Smart insights
    reports/            # Reports & data export

components/
  providers/
    StoreProvider.tsx   # React context for all app data
  ui/
    BottomNav.tsx       # Navigation bar
    Button.tsx          # Button + FAB
    Card.tsx            # Card components
    Badge.tsx           # Status badges
    ProgressBar.tsx     # Progress bars
    ProgressRing.tsx    # Circular progress
    Modal.tsx           # Bottom sheet modal
    Input.tsx           # Input, Select, Textarea
  charts/
    AllocationChart.tsx # Pie/donut chart
    CashFlowChart.tsx   # Bar chart

lib/
  types.ts              # TypeScript interfaces
  store.ts              # localStorage CRUD
  calculations.ts       # Financial logic & computations
  seed.ts               # Demo data
  utils.ts              # Helpers (cn, generateId, formatDate)

public/
  manifest.json         # PWA manifest
  icons/                # App icons
```

---

## Deploying to Vercel

```bash
npm install -g vercel
vercel --prod
```

Or connect the GitHub repo to [vercel.com](https://vercel.com) for automatic deploys.

---

## Data Model

| Type | Description |
|------|-------------|
| `UserSettings` | Currency, theme, budget period, name |
| `Category` | Budget categories with planned amounts |
| `Transaction` | Income/expense/bill/saving/debt entries |
| `Goal` | Savings or debt payoff goals |
| `GoalTransaction` | Individual contributions to goals |

All data is stored in browser `localStorage` — **100% private, no server required**.

---

## License

MIT
