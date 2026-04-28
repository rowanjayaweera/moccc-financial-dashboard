import React from 'react';
import { formatCurrency, getMetricForRows, isFavourableVariance } from '../utils/financialUtils';

function Summary({ data, openingBalance = 0 }) {
  const metrics = getMetricForRows(data);
  const netMovement = metrics.actualProfit;
  const closingBalance = openingBalance + netMovement;

  const rows = [
    {
      title: 'Revenue',
      actual: metrics.actualRevenue,
      budget: metrics.budgetRevenue,
      type: 'Revenue',
    },
    {
      title: 'Expense',
      actual: metrics.actualExpense,
      budget: metrics.budgetExpense,
      type: 'Expense',
    },
    {
      title: 'Net Movement',
      actual: metrics.actualProfit,
      budget: metrics.budgetProfit,
      type: 'Revenue',
    },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
      <section className="statement-card p-5">
        <div className="mb-5">
          <p className="eyebrow">Financial position</p>
          <h2 className="mt-1 font-brand text-xl text-slate-950 dark:text-white">Summary Position</h2>
        </div>

        <div className="overflow-x-auto rounded-[22px] border border-slate-200/70 bg-white/80 dark:border-white/10 dark:bg-white/[0.03]">
          <table className="statement-table">
            <thead>
              <tr>
                <th className="text-left">Measure</th>
                <th className="text-right">Actual</th>
                <th className="text-right">Budget</th>
                <th className="text-right">Variance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const variance = row.actual - row.budget;
                const favourable = isFavourableVariance(variance, row.type);
                return (
                  <tr key={row.title} className="transition hover:bg-slate-50/80 dark:hover:bg-white/[0.03]">
                    <td className="font-semibold text-slate-950 dark:text-white">{row.title}</td>
                    <td className="text-right font-semibold tabular-nums text-slate-950 dark:text-white">
                      {formatCurrency(row.actual)}
                    </td>
                    <td className="text-right tabular-nums text-slate-500 dark:text-slate-400">
                      {formatCurrency(row.budget)}
                    </td>
                    <td className={`text-right font-semibold tabular-nums ${favourable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {formatCurrency(variance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6">
        <section className="statement-card p-5">
          <p className="eyebrow">Cash bridge</p>
          <h2 className="mt-1 font-brand text-xl text-slate-950 dark:text-white">Cash Balance Summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <BalanceRow label="Opening Balance" value={formatCurrency(openingBalance)} />
            <BalanceRow
              label="Net Movement"
              value={formatCurrency(netMovement)}
              tone={netMovement < 0 ? 'negative' : 'positive'}
            />
            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-lg font-semibold dark:border-white/10">
              <span>Closing Balance</span>
              <span>{formatCurrency(closingBalance)}</span>
            </div>
          </div>
        </section>

        <section className="statement-card p-5">
          <p className="eyebrow">Club details</p>
          <h2 className="mt-1 font-brand text-xl text-slate-950 dark:text-white">Mazenod Cricket Club</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>Affiliations: ECA, FTGDCA, ISEC</p>
            <p>ABN: 54 530 186 804</p>
            <p>Kernot Avenue, Mulgrave 3170</p>
            <p>Prepared by: Rowan Jayaweera</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function BalanceRow({ label, value, tone }) {
  const toneClass =
    tone === 'negative'
      ? 'text-rose-600 dark:text-rose-400'
      : tone === 'positive'
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-slate-950 dark:text-white';

  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50/80 px-4 py-3 dark:bg-white/[0.04]">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className={`font-semibold tabular-nums ${toneClass}`}>{value}</span>
    </div>
  );
}

export default Summary;
