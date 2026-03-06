# MOCCC Financial Dashboard

Financial dashboard and reporting pack for Mazenod Old Collegians Cricket Club, designed for cash-basis reporting.

## What It Does

- Imports a CSV transaction extract and calculates:
  - Actual, budget, and prior-year revenue/expense totals
  - Net cash movement (cash in less cash out)
  - Variance to budget and prior year
  - Category-level and item-level P&L views
- Supports multi-year reporting from one CSV
- Includes dark/light mode
- Persists uploaded CSV, selected theme, and opening cash balance in browser storage

## CSV Schema

Expected columns:

- `Year`
- `Type` (`Revenue` or `Expense`)
- `Category`
- `Item`
- `Amount`
- `IsActual` (`true/false`, `1/0`, `yes/no` supported)
- `IsBudget`
- `IsPriorYear`

Notes:

- Use one row per metric point (for example, one row for actual, one for budget, one for prior year).
- Amounts should be positive values; `Type` determines whether they are treated as cash in or cash out.

## Run Locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

Use the `Download template` button in the app header to get a starter CSV schema.

## Build

```bash
npm run build
```

## Recommended Next Enhancements

- Add CSV template download and schema validation report
- Add board-ready PDF export for each tab
- Add monthly trend view (not just annual view)
- Add scenario/budget planning mode for upcoming season
