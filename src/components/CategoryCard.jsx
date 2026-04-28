import React from 'react';
import { formatCurrency, getMetricForRows } from '../utils/financialUtils';

function CategoryCard({ data, type }) {
  const metrics = getMetricForRows(data);
  const actualTotal = type === 'Revenue' ? metrics.actualRevenue : metrics.actualExpense;
  const budgetTotal = type === 'Revenue' ? metrics.budgetRevenue : metrics.budgetExpense;
  const variance = actualTotal - budgetTotal;
  const variancePercent = budgetTotal === 0 ? '-' : `${((variance / budgetTotal) * 100).toFixed(1)}%`;
  const favourable = type === 'Expense' ? variance <= 0 : variance >= 0;

  return (
    <div className={`metric-card ${type === 'Revenue' ? 'metric-card-green' : 'metric-card-red'}`}>
      <div className="eyebrow">{type}</div>
      <div className="mt-3 font-brand text-3xl text-slate-950 dark:text-white">{formatCurrency(actualTotal)}</div>
      <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">Budget {formatCurrency(budgetTotal)}</div>
      <div className={`mt-5 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${favourable ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'}`}>
        {formatCurrency(variance)} ({variancePercent})
      </div>
    </div>
  );
}

export default CategoryCard;
