import React from 'react';
import { formatCurrency, getMetricForRows } from '../utils/financialUtils';

function CashBalanceSummaryCard({ data, openingBalance = 0 }) {
  const metrics = getMetricForRows(data);
  const netMovement = metrics.actualProfit;
  const closingBalance = openingBalance + netMovement;

  return (
    <div className="statement-card p-5">
      <p className="eyebrow">Cash bridge</p>
      <h3 className="mt-1 font-brand text-xl text-slate-950 dark:text-white">Cash Balance Summary</h3>
      <div className="mt-5 space-y-3 text-sm">
        <BalanceLine label="Opening Balance" value={formatCurrency(openingBalance)} />
        <BalanceLine label="Net Movement" value={formatCurrency(netMovement)} tone={netMovement < 0 ? 'negative' : 'positive'} />
        <div className="flex justify-between border-t border-slate-200 pt-4 font-semibold dark:border-white/10">
          <span>Closing Balance</span>
          <span>{formatCurrency(closingBalance)}</span>
        </div>
      </div>
    </div>
  );
}

function BalanceLine({ label, value, tone }) {
  const toneClass =
    tone === 'negative'
      ? 'text-rose-600 dark:text-rose-400'
      : tone === 'positive'
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-slate-950 dark:text-white';

  return (
    <div className="flex justify-between rounded-2xl bg-slate-50/80 px-4 py-3 dark:bg-white/[0.04]">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className={`font-semibold tabular-nums ${toneClass}`}>{value}</span>
    </div>
  );
}

export default CashBalanceSummaryCard;
