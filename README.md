# FinTrack — Intelligent Personal Finance & Deterministic Ledger

[![CI/CD Pipeline](https://github.com/mkaramujic80/FinTrack/actions/workflows/ci.yml/badge.svg)](https://github.com/mkaramujic80/FinTrack/actions)
![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.2-646cff?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38bdf8?logo=tailwind-css&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-5.0-729b1b?logo=vitest&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-emerald)

FinTrack is an AI-powered, deterministic personal finance management platform engineered for real-time liquidity tracking, category budget enforcement, multi-currency ledger reconciliation, recurring subscription audits, and goal-oriented savings runway modeling.

---

## Key Features

### 1. Deterministic Multi-Account Ledger
- **Asset & Liability Segregation**: Separate checking accounts, savings reserves, cash wallets, and credit cards.
- **Double-Entry Transfer Neutrality**: Inter-account transfers credit one account and debit the target account while strictly preserving total net worth.
- **Credit Card Liability Tracking**: Purchases increase outstanding card debt; payments directly reduce balance liabilities.
- **Precision Floating-Point Defense**: Strict 2-decimal rounding on all currency operations eliminates IEEE 754 rounding discrepancies.

### 2. Multi-Currency Engine
- Native support for **EUR**, **BAM (KM)**, **USD**, **GBP**, **CHF**, and **CAD**.
- Automatic conversion against pegged and floating matrix rates with user-preferred reporting currency.

### 3. Smart Category Budgeting & Overrun Defense
- Set monthly limits per expense category (Housing, Groceries, Dining, Utilities, Transport, etc.).
- Real-time progress bars with dynamic status indicators:
  - **Safe** (<80% spent)
  - **Warning** (80% - 90% spent)
  - **Critical** (90% - 100% spent)
  - **Exceeded** (>100% spent)

### 4. Subscription & Recurring Expense Auditor
- Monitors active monthly and annual recurring services (software, streaming, gym, insurance).
- Live renewal countdowns and annual projected burn analytics.

### 5. Savings Goals & Runway Estimator
- Track emergency fund runways (months of survival based on trailing monthly expenses).
- Dedicated milestone goals with progress tracking and direct deposit logging.

### 6. Interactive Financial Analytics
- Monthly cash flow trends (Income vs. Expense).
- Category distribution charts powered by Recharts.
- Month-over-month income and expenditure delta calculations.

### 7. Data Mobility & CSV Backup
- One-click CSV export and robust CSV import parser with automated header mapping and validation.
- JSON profile and transaction backup / restore.

---

## Testing & CI/CD Pipeline

FinTrack includes a comprehensive automated test suite executed via **Vitest** in continuous integration:

```
Test Files  6 passed (6)
Tests       24 passed (24)
Duration    1.65s
```

| Test Suite | Focus Area | Status |
|---|---|:---:|
| `src/tests/ledger.test.ts` | Deterministic balances, transfers, credit cards, float rounding | Passing |
| `src/tests/auth.test.ts` | Multi-user isolation, session persistence, tenant resets | Passing |
| `src/tests/metrics.test.ts` | Net worth, savings rates, budget thresholds, MoM deltas | Passing |
| `src/tests/currency.test.ts` | Currency matrix conversions and symbol formatting | Passing |
| `src/tests/validations.test.ts` | Zod schema input validation and error boundaries | Passing |
| `src/tests/csv.test.ts` | CSV generation, escaping, and sanitization | Passing |

### GitHub Actions Workflow (`.github/workflows/ci.yml`)
The automated CI pipeline validates every push and pull request:
1. **Checkout & Node 20 Setup** with npm dependency caching.
2. **Deterministic Clean Install** (`npm ci` via checked-in `package-lock.json`).
3. **Type-Safety & Linting** (`npm run lint` / `tsc --noEmit`).
4. **Unit & Integration Suite** (`npm test -- --run`).
5. **Production Build** (`npm run build`).

---

## Tech Stack

- **Framework**: React 19 + TypeScript 5.8
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4 + Motion
- **Icons**: Lucide React
- **Visualizations**: Recharts
- **Validation**: Zod
- **Testing**: Vitest
- **Backend/API**: Express 4 (Integrated Proxy for Server-Side AI Intelligence)

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm 10+

### Installation
```bash
# Clone the repository
git clone https://github.com/mkaramujic80/FinTrack.git
cd FinTrack

# Install locked dependencies
npm ci
```

### Development
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### Quality Assurance & Build
```bash
# Type check and linting
npm run lint

# Run Vitest test suite
npm test

# Build production bundle
npm run build

# Preview production build
npm run preview
```

---

## Repository Structure

```
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated CI/CD pipeline
├── src/
│   ├── components/              # Shared UI design system & accessible modals
│   ├── features/
│   │   ├── accounts/            # Accounts ledger & transfer management
│   │   ├── analytics/           # Recharts visual analytics
│   │   ├── auth/                # Authentication, profile & tenant contexts
│   │   ├── budgets/             # Budget adherence & spending limits
│   │   ├── data/                # Data provider & centralized operations
│   │   ├── goals/               # Savings runway & target pacing
│   │   ├── subscriptions/       # Recurring expense auditor
│   │   └── transactions/        # Transaction ledger, filters & CSV tools
│   ├── lib/
│   │   ├── currency.ts          # Matrix conversions & formatting
│   │   ├── metrics.ts           # Financial calculation engine
│   │   ├── storage.ts           # Persistent storage & multi-tenant isolation
│   │   └── validations.ts       # Zod schemas
│   └── tests/                   # 6 Vitest test suites
├── metadata.json                # Project metadata
├── package.json                 # Project dependencies & scripts
├── package-lock.json            # Deterministic lockfile for npm ci
├── tsconfig.json                # TypeScript compiler configuration
└── vite.config.ts               # Vite configuration
```

---

## License

This project is licensed under the [MIT License](LICENSE).
