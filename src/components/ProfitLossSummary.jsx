import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import {
  buildCategoryRows,
  formatCurrency,
  formatPercent,
  getMetricForRows,
  isFavourableVariance,
} from '../utils/financialUtils';

function ProfitLossSummary({ data }) {
  const revenueRows = buildCategoryRows(data, 'Revenue');
  const expenseRows = buildCategoryRows(data, 'Expense');
  const metrics = getMetricForRows(data);

  return (
    <section className="statement-card p-5">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Compact statement</p>
          <h2 className="mt-1 font-brand text-xl text-slate-950 dark:text-white">P&amp;L Summary by Category</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[#EFF7FD] px-3 py-1 text-[11px] font-semibold text-[#23447C] ring-1 ring-[#CDE5F5] dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20">
            AUD local currency
          </span>
          <span className="rounded-full bg-[#F3FAED] px-3 py-1 text-[11px] font-semibold text-[#2D8F48] ring-1 ring-[#D5EAC9] dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">
            Cash basis
          </span>
        </div>
      </div>

      <div className="statement-table-frame overflow-auto rounded-[22px] border border-slate-200/70 bg-white/80 dark:border-white/10 dark:bg-white/[0.03]">
        <table className="statement-table min-w-[980px]">
          <thead>
            <tr>
              <th className="text-left">Category</th>
              <th className="text-right">Actual</th>
              <th className="text-right">Budget</th>
              <th className="text-right">Var $</th>
              <th className="text-right">Prior Year</th>
              <th className="text-right">Var $ to LY</th>
            </tr>
          </thead>
          <tbody>
            <SectionHeader title="Revenue" />
            {revenueRows.map((row) => <StatementRow key={`rev-${row.category}`} row={row} />)}
            <TotalRow
              label="TOTAL REVENUE"
              actual={metrics.actualRevenue}
              budget={metrics.budgetRevenue}
              prior={metrics.priorRevenue}
              type="Revenue"
            />

            <SpacerRow />

            <SectionHeader title="Expense" />
            {expenseRows.map((row) => <StatementRow key={`exp-${row.category}`} row={row} />)}
            <TotalRow
              label="TOTAL EXPENSES"
              actual={metrics.actualExpense}
              budget={metrics.budgetExpense}
              prior={metrics.priorExpense}
              type="Expense"
            />

            <SpacerRow />

            <TotalRow
              label="Net Profit (Loss)"
              actual={metrics.actualProfit}
              budget={metrics.budgetProfit}
              prior={metrics.priorProfit}
              type="Revenue"
              final
            />
            <tr className="detail-margin-row">
              <td>Net Profit %</td>
              <td className="text-right tabular-nums">{formatPercent(metrics.marginActual)}</td>
              <td className="text-right tabular-nums">{formatPercent(metrics.marginBudget)}</td>
              <td />
              <td className="text-right tabular-nums">{formatPercent(metrics.marginPrior)}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SectionHeader({ title }) {
  return (
    <tr className="detail-section-row">
      <td colSpan="6">
        {title}
      </td>
    </tr>
  );
}

function SpacerRow() {
  return (
    <tr className="statement-spacer-row">
      <td colSpan="6" />
    </tr>
  );
}

function StatementRow({ row }) {
  return (
    <tr className="transition hover:bg-slate-50/80 dark:hover:bg-white/[0.03]">
      <td className="font-medium text-slate-700 dark:text-slate-300">{row.category}</td>
      <td className="text-right tabular-nums text-slate-950 dark:text-white">{formatCurrency(row.actual)}</td>
      <td className="text-right tabular-nums text-slate-500 dark:text-slate-400">{formatCurrency(row.budget)}</td>
      <VarianceCell value={row.varToBudget} type={row.type} />
      <td className="text-right tabular-nums text-slate-500 dark:text-slate-400">{formatCurrency(row.prior)}</td>
      <VarianceCell value={row.varToPrior} type={row.type} />
    </tr>
  );
}

function TotalRow({ label, actual, budget, prior, type, final = false }) {
  const varToBudget = actual - budget;
  const varToPrior = actual - prior;

  return (
    <tr className={final ? 'detail-net-row' : 'detail-grand-total-row'}>
      <td className="text-slate-950 dark:text-white">{label}</td>
      <td className="text-right tabular-nums text-slate-950 dark:text-white">{formatCurrency(actual)}</td>
      <td className="text-right tabular-nums text-slate-500 dark:text-slate-400">{formatCurrency(budget)}</td>
      <VarianceCell value={varToBudget} type={type} />
      <td className="text-right tabular-nums text-slate-500 dark:text-slate-400">{formatCurrency(prior)}</td>
      <VarianceCell value={varToPrior} type={type} />
    </tr>
  );
}

function VarianceCell({ value, type }) {
  const favourable = isFavourableVariance(value, type);
  const Icon = favourable ? ArrowUpRight : ArrowDownRight;

  return (
    <td className={`text-right font-semibold tabular-nums ${favourable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
      <span className="inline-flex items-center justify-end gap-1">
        {formatCurrency(value)}
        {value !== 0 ? <Icon className="h-3.5 w-3.5" /> : null}
      </span>
    </td>
  );
}

export default ProfitLossSummary;
