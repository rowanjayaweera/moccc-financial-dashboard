import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import {
  buildDetailedRows,
  formatCurrency,
  formatPercent,
  getMetricForRows,
  isFavourableVariance,
} from '../utils/financialUtils';

function DetailedBreakdown({ data }) {
  const revenueGroups = buildDetailedRows(data, 'Revenue');
  const expenseGroups = buildDetailedRows(data, 'Expense');
  const metrics = getMetricForRows(data);

  return (
    <section className="statement-card p-5">
      <div className="mb-5">
        <p className="eyebrow">Appendix detail</p>
        <h2 className="mt-1 font-brand text-xl text-slate-950 dark:text-white">Detailed Financial Breakdown</h2>
      </div>

      <div className="statement-table-frame overflow-auto rounded-[22px] border border-slate-200/70 bg-white/80 dark:border-white/10 dark:bg-white/[0.03]">
        <table className="statement-table min-w-[980px]">
          <thead>
            <tr>
              <th className="text-left">Item</th>
              <th className="text-right">Actual</th>
              <th className="text-right">Budget</th>
              <th className="text-right">Var $</th>
              <th className="text-right">Prior Year</th>
              <th className="text-right">Var $ to LY</th>
            </tr>
          </thead>
          <tbody>
            <GroupTitle title="Revenue" />
            {revenueGroups.map((group) => <CategoryGroup key={`rev-${group.category}`} group={group} />)}
            <TotalRow
              label="TOTAL REVENUE"
              actual={metrics.actualRevenue}
              budget={metrics.budgetRevenue}
              prior={metrics.priorRevenue}
              type="Revenue"
            />

            <SpacerRow />

            <GroupTitle title="Expense" />
            {expenseGroups.map((group) => <CategoryGroup key={`exp-${group.category}`} group={group} />)}
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

function GroupTitle({ title }) {
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

function TotalRow({ label, actual, budget, prior, type, final = false }) {
  const varToBudget = actual - budget;
  const varToPrior = actual - prior;

  return (
    <tr className={final ? 'detail-net-row' : 'detail-grand-total-row'}>
      <td>{label}</td>
      <td className="text-right tabular-nums text-slate-950 dark:text-white">{formatCurrency(actual)}</td>
      <td className="text-right tabular-nums text-slate-500 dark:text-slate-400">{formatCurrency(budget)}</td>
      <VarianceCell value={varToBudget} type={type} />
      <td className="text-right tabular-nums text-slate-500 dark:text-slate-400">{formatCurrency(prior)}</td>
      <VarianceCell value={varToPrior} type={type} />
    </tr>
  );
}

function CategoryGroup({ group }) {
  return (
    <>
      <tr className="detail-category-row">
        <td colSpan="6">
          {group.category}
        </td>
      </tr>
      {group.items.map((item) => (
        <tr key={`${group.category}-${item.item}`} className="transition hover:bg-slate-50/80 dark:hover:bg-white/[0.03]">
          <td className="pl-8 text-slate-600 dark:text-slate-300">{item.item}</td>
          <td className="text-right tabular-nums text-slate-950 dark:text-white">{formatCurrency(item.actual)}</td>
          <td className="text-right tabular-nums text-slate-500 dark:text-slate-400">{formatCurrency(item.budget)}</td>
          <VarianceCell value={item.varToBudget} type={group.type} />
          <td className="text-right tabular-nums text-slate-500 dark:text-slate-400">{formatCurrency(item.prior)}</td>
          <VarianceCell value={item.varToPrior} type={group.type} />
        </tr>
      ))}
      <tr className="detail-total-row">
        <td>Total {group.category}</td>
        <td className="text-right tabular-nums text-slate-950 dark:text-white">{formatCurrency(group.totals.actual)}</td>
        <td className="text-right tabular-nums text-slate-500 dark:text-slate-400">{formatCurrency(group.totals.budget)}</td>
        <VarianceCell value={group.totals.varToBudget} type={group.type} />
        <td className="text-right tabular-nums text-slate-500 dark:text-slate-400">{formatCurrency(group.totals.prior)}</td>
        <VarianceCell value={group.totals.varToPrior} type={group.type} />
      </tr>
    </>
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

export default DetailedBreakdown;
