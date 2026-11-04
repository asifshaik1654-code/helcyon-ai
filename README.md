# Helcyon AI — Personal Financial Intelligence Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20RLS-3ecf8e.svg)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-orange.svg)](https://ai.google.dev/)
[![Tests](https://img.shields.io/badge/Tests-6%20Suites%20Passing-brightgreen.svg)]()

> **Helcyon AI** is a production-grade personal financial intelligence platform built to eliminate financial anxiety through deterministic financial engineering, statistical anomaly detection, and explainable artificial intelligence powered by **Google Gemini**.

---

## 🏛️ System Architecture

```
                                  ┌─────────────────────────────────────────┐
                                  │   React 19 + Vite Frontend (SPA)        │
                                  │   • Tailwind CSS (Fintech Dark Slate)   │
                                  │   • Recharts Financial Visualizers      │
                                  │   • React Router v7 HashRouter          │
                                  │   • PapaParse CSV Engine                │
                                  └────────────────────┬────────────────────┘
                                                       │ HTTPS / JWT
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │     Express.js API Backend (ESM)        │
                                  │   • Helmet & CORS Defense               │
                                  │   • Zod Schema Input Sanitization       │
                                  │   • JWT Auth & Bearer Middleware        │
                                  │   • Statistical Anomaly Detector (σ)    │
                                  │   • Recurring Subscriptions Detector    │
                                  │   • Offline Presentation Demo Engine    │
                                  └──────────────┬──────────────────┬───────┘
                                                 │                  │
                   User-Scoped Bearer Token      │                  │ Server-to-Server
                                                 ▼                  ▼
              ┌─────────────────────────────────────┐      ┌─────────────────────────────┐
              │    Supabase PostgreSQL Database     │      │   Google Gemini 1.5 API     │
              │  • NUMERIC(12,2) Fixed Precision    │      │  • Grounded Context Prompts │
              │  • Row-Level Security (RLS)         │      │  • Category Suggestions     │
              │  • Multi-Tenant User Isolation      │      │  • Chatbot Financial Engine │
              │  • Cascading Foreign Keys           │      │  • Deterministic Fallback   │
              └─────────────────────────────────────┘      └─────────────────────────────┘
```

### Core Architectural Principles:
1. **AI for Reasoning, Code for Math**: Financial numbers (totals, net surplus, budget percentages, goal trajectories) are calculated exclusively by deterministic Node.js and SQL code. The LLM is provided verified numbers to explain, guaranteeing zero numerical hallucinations.
2. **Zero Secrets on Client**: The Google Gemini API key and Supabase Service Role Key are maintained exclusively in server environment variables.
3. **Multi-Tenant Security via PostgreSQL RLS**: Every table enforces Row-Level Security using `auth.uid() = user_id`. Even in the event of an API bug, cross-tenant data leaks are mathematically impossible at the database layer.
4. **Dual-Mode Architecture**: Works seamlessly in **Live Supabase Mode** (real cloud database) and **Local Developer/Demo Mode** (zero cloud setup required for college evaluations or offline viva presentations).

---

## 🚀 Key Feature Modules

| Module | Features & Capabilities |
|---|---|
| **📊 Financial Dashboard** | Real-time metric cards (Monthly Inflow, Outflow, Disposable Balance, Savings Rate), Recharts 6-month comparative bar charts, category donut distribution, recent activity ledger, and AI observation banner. |
| **🧾 Transaction Ledger** | Full CRUD, instant search, multi-field filtering (category, type, date range), server-side pagination, and batch CSV import with PapaParse and duplicate detection. |
| **🎯 Budgets & Alerts** | Category-level budgeting, progress bars with dynamic status indicators (`safe` <80%, `warning` 80–100%, `danger` >100%), and proactive notification triggers. |
| **🏆 Savings Goals** | Milestone tracking, target completion dates, incremental deposit logging, remaining amount calculations, and completion badges. |
| **🔄 Recurring Intelligence** | Subscription tracking (Rent, Broadband, OTT, Utilities), automated cadence detection, and monthly fixed-cost obligation rollups. |
| **⚡ Anomaly Detection** | Statistical spending spike engine ($z$-score / mean + $1.5\sigma$ per category), duplicate charge detection within 72 hours, and explainable flagged observations. |
| **🤖 Gemini AI Assistant** | Grounded conversational drawer with multi-turn memory, real-time merchant auto-categorization, and purchase affordability evaluator. |
| **🔮 What-If Simulator** | Real-time sandbox levers (income adjustment, rent change, discretionary cuts, new subscriptions, extra savings) with instant 12-month wealth projection and goal acceleration math. |
| **📅 Unified Calendar** | Day-by-day agenda matrix mapping salary credits, utility payments, subscription due dates, and goal milestones across time. |
| **🔔 Notification Center** | Real-time alerts for impending bills (due in $\le 7$ days), budget overruns (>80% / >100%), and goal milestone celebrations. |

---

## 📁 Repository Structure

```
helcyon-ai/
├── client/                               # Frontend Single Page Application
│   ├── public/                           # Favicon and static CSV templates
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/                   # Recharts wrappers (IncomeExpenseChart, CategoryPie)
│   │   │   ├── layout/                   # Sidebar, Navbar, DashboardLayout, ProtectedRoute
│   │   │   ├── transactions/             # TransactionTable, FilterBar, FormModal, CSVImportModal
│   │   │   └── ui/                       # Atomic primitives (Button, Card, Badge, Modal, Input)
│   │   ├── context/                      # AuthContext (Supabase + Demo token state)
│   │   ├── hooks/                        # useTransactions, useDashboard, useBudgets
│   │   ├── pages/                        # 12 Route Views (Dashboard, Simulator, Assistant, Calendar...)
│   │   ├── services/                     # Centralized API fetchers (apiClient, aiService, etc.)
│   │   ├── types/                        # Strict TypeScript interfaces
│   │   └── utils/                        # formatCurrency (₹ / $), formatDate, cn helper
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── server/                               # Backend REST API Server
│   ├── src/
│   │   ├── config/                       # env.ts, supabase.ts (scoped clients)
│   │   ├── controllers/                  # Business logic (auth, transactions, ai, dashboard...)
│   │   ├── middleware/                   # requireAuth, error handlers
│   │   ├── routes/                       # Express router mounts
│   │   ├── schemas/                      # Zod validation schemas
│   │   ├── services/                     # geminiService.ts (LLM + Context Engine)
│   │   ├── tests/                        # 6 automated test suites (run_all_tests.ts)
│   │   ├── types/                        # Express user augmentations
│   │   └── app.ts                        # Express server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── supabase/
│   └── migrations/                       # PostgreSQL migrations with RLS policies
├── README.md                             # Platform master documentation
└── VIVA_PRESENTATION_GUIDE.md            # Comprehensive College Viva & Defense Guide
```

---

## 🛠️ Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: v20 or higher
- **npm** or **pnpm**

### 2. Clone Repository & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/shaik-asif/helcyon-ai.git
cd helcyon-ai

# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 3. Environment Variables
Both frontend and backend are pre-configured to run out-of-the-box in **Presentation Demo Mode** even without external API credentials. To connect live services:

#### Server (`server/.env`):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Supabase (Optional: omit to use in-memory demo engine)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google Gemini API Key (Optional: falls back to deterministic context engine)
GEMINI_API_KEY=your-gemini-api-key
```

#### Client (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Running the Development Servers
In two separate terminal windows:

```bash
# Terminal 1: Start Backend (Port 5000)
cd server
npm run dev

# Terminal 2: Start Frontend (Port 5173)
cd client
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🧪 Automated Test Suite

Helcyon AI includes 6 end-to-end integration test suites verifying all security guards, CRUD endpoints, mathematical formulas, AI fallback routines, and CSV ingestion:

```bash
cd server
npm test
```

### Test Coverage Breakdown:
1. `auth.test.ts` — Authentication, session validation, token verification, profile update.
2. `transactions.test.ts` — Transaction creation, Zod schema validation, pagination, category filtering, duplicate detection, batch CSV import, deletion.
3. `dashboard.test.ts` — Aggregated monthly income, expenses, cash flow calculations, trend lines.
4. `budgets_savings.test.ts` — Category budget limits, over-budget alert status, goal contributions, milestone progress math.
5. `intelligence_ai.test.ts` — Recurring subscription cadence detection, statistical spending anomaly detection, Gemini auto-categorization, grounded chat responses.
6. `notifications.test.ts` — Budget warnings (>80%), critical budget overruns (>100%), upcoming recurring bill reminders, mark-as-read endpoints.

**All 6 suites pass with 100% success rate.**

---

## 🔒 Security & Data Integrity

- **PostgreSQL `NUMERIC(12,2)`**: Avoids IEEE 754 binary floating-point rounding errors common in fintech applications.
- **Row-Level Security (RLS)**: Enforced via PostgreSQL policies `FOR ALL USING (auth.uid() = user_id)`.
- **Zod Schema Validation**: Every API payload is validated before hitting the database, preventing injection attacks.
- **Rate-Limited AI Queries**: Chat and categorization endpoints are rate-limited and protected behind authentication.
- **Explainable Anomaly Engine**: Detects statistical deviations without making defamatory fraud claims, strictly classifying items as "Spending Spikes" or "Duplicate Charges".

---

## 🎓 College Viva & Project Defense

For complete viva preparation, architecture defense, and a step-by-step 5-minute presentation script, refer to:
👉 [**VIVA_PRESENTATION_GUIDE.md**](./VIVA_PRESENTATION_GUIDE.md)

---

## 👤 Author & Academic Credits
- **Developer**: Shaik Asif
- **Project**: Helcyon AI — Personal Financial Intelligence Platform
- **License**: MIT

