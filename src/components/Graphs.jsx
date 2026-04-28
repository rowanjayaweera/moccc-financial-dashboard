import React, { useEffect, useState } from 'react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import {
  formatCurrency,
  getMetricForRows,
  getPresentationCategoryMix,
  getYearSeries,
  getYears,
} from '../utils/financialUtils';

const COLORS = ['#2D8F48', '#23447C', '#F2A23A', '#C83E2E', '#475569', '#94A3B8'];

function Graphs({ data, selectedYear: parentSelectedYear, printMode = false }) {
  const [selectedYear, setSelectedYear] = useState(parentSelectedYear || '');
  const years = getYears(data);

  useEffect(() => {
    if (parentSelectedYear) {
      setSelectedYear(parentSelectedYear);
    }
  }, [parentSelectedYear]);

  const filteredData = data.filter((row) => row.Year === selectedYear);
  const revenueData = getPresentationCategoryMix(filteredData, 'Revenue');
  const expenseData = getPresentationCategoryMix(filteredData, 'Expense');
  const metrics = getMetricForRows(filteredData);
  const cashFlowData = [
    { name: 'Revenues', value: metrics.actualRevenue },
    { name: 'Expenses', value: metrics.actualExpense },
  ].filter((entry) => entry.value > 0);
  const yoyData = getYearSeries(data);

  if (printMode) {
    return (
      <section className="statement-card graphs-print-sheet p-5">
        <div className="mb-5">
          <p className="eyebrow">Visual analysis</p>
          <h2 className="mt-1 font-brand text-xl text-slate-950 dark:text-white">Graphs and Visuals</h2>
        </div>

        <div className="graphs-print-grid">
          <VisualPanel accent="orange" title="Revenue Mix" compact>
            <HorizontalMixChart data={revenueData} />
          </VisualPanel>
          <VisualPanel accent="blue" title="Expense Mix" compact>
            <HorizontalMixChart data={expenseData} />
          </VisualPanel>
          <VisualPanel accent="green" title="Revenues vs Expenses" compact>
            <DonutMixChart data={cashFlowData} compact />
          </VisualPanel>
          <TrendComparisonCard
            accent="green"
            title="Revenue"
            valueKey="Revenue"
            rows={yoyData}
            selectedYear={selectedYear}
          />
          <TrendComparisonCard
            accent="blue"
            title="Expenses"
            valueKey="Expense"
            rows={yoyData}
            selectedYear={selectedYear}
            lowerIsBetter
          />
          <TrendComparisonCard
            accent="orange"
            title="Net Profit"
            valueKey="Profit"
            rows={yoyData}
            selectedYear={selectedYear}
            signed
          />
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="statement-card p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Visual analysis</p>
            <h2 className="mt-1 font-brand text-xl text-slate-950 dark:text-white">Graphs and Visuals</h2>
          </div>
          {!printMode && (
            <div className="no-print flex flex-wrap gap-2">
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="hub-select w-[120px]">
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <VisualPanel accent="orange" title="Revenue Mix">
            <HorizontalMixChart data={revenueData} />
          </VisualPanel>
          <VisualPanel accent="blue" title="Expense Mix">
            <HorizontalMixChart data={expenseData} />
          </VisualPanel>
          <VisualPanel accent="green" title="Revenues vs Expenses">
            <DonutMixChart data={cashFlowData} />
          </VisualPanel>
        </div>
      </section>

      <section className="statement-card p-5">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Trend</p>
            <h2 className="mt-1 font-brand text-xl text-slate-950 dark:text-white">Year-on-Year Movement</h2>
          </div>
          <span className="trend-context-pill">Actual cash basis</span>
        </div>
        <div className="trend-comparison-grid">
          <TrendComparisonCard
            accent="green"
            title="Revenue"
            valueKey="Revenue"
            rows={yoyData}
            selectedYear={selectedYear}
          />
          <TrendComparisonCard
            accent="blue"
            title="Expenses"
            valueKey="Expense"
            rows={yoyData}
            selectedYear={selectedYear}
            lowerIsBetter
          />
          <TrendComparisonCard
            accent="orange"
            title="Net Profit"
            valueKey="Profit"
            rows={yoyData}
            selectedYear={selectedYear}
            signed
          />
        </div>
      </section>
    </div>
  );
}

function VisualPanel({ accent, title, children, compact = false }) {
  return (
    <div className={`visual-panel visual-panel-${accent}`}>
      <div className="mb-4 flex items-center gap-2">
        <span className={`visual-dot visual-dot-${accent}`} />
        <h3 className="font-brand text-base text-slate-950 dark:text-white">{title}</h3>
      </div>
      <div className={`chart-inner ${compact ? 'h-[210px]' : 'h-[320px]'}`}>{children}</div>
    </div>
  );
}

function HorizontalMixChart({ data }) {
  const maxValue = Math.max(...data.map((entry) => entry.value), 0);

  if (!data.length || maxValue === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        No data available
      </div>
    );
  }

  return (
    <div className="mix-chart">
      <div className="mix-chart-plot">
        <div className="mix-gridline mix-gridline-25" />
        <div className="mix-gridline mix-gridline-50" />
        <div className="mix-gridline mix-gridline-75" />
        {data.map((entry, index) => {
          const width = `${Math.max((entry.value / maxValue) * 100, 2)}%`;
          const color = COLORS[index % COLORS.length];

          return (
            <div key={entry.name} className="mix-row">
              <div className="mix-label" title={entry.name}>{entry.name}</div>
              <div className="mix-track">
                <div className="mix-bar" style={{ width, backgroundColor: color }} />
              </div>
              <div className="mix-value">{shortCurrency(entry.value)}</div>
            </div>
          );
        })}
      </div>
      <div className="mix-axis">
        <span>$0</span>
        <span>{shortCurrency(maxValue * 0.5)}</span>
        <span>{shortCurrency(maxValue)}</span>
      </div>
    </div>
  );
}

function DonutMixChart({ data, compact = false }) {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  const innerRadius = compact ? 36 : 62;
  const outerRadius = compact ? 58 : 100;

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={innerRadius} outerRadius={outerRadius} paddingAngle={2}>
              {data.map((entry, index) => (
                <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip
              formatter={(value, name) => {
                const percentage = total ? `${((value / total) * 100).toFixed(1)}%` : '0.0%';
                return [`${formatCurrency(value)} (${percentage})`, name];
              }}
              contentStyle={tooltipStyle()}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="donut-stat-grid">
        {data.map((entry, index) => (
          <div key={entry.name} className="donut-stat">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span className="font-semibold text-slate-600 dark:text-slate-300">{entry.name}</span>
            <strong>{formatCurrency(entry.value)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendComparisonCard({ accent, title, valueKey, rows, selectedYear, lowerIsBetter = false, signed = false }) {
  const maxValue = Math.max(...rows.map((entry) => Math.abs(Number(entry[valueKey]) || 0)), 1);
  const selectedIndex = rows.findIndex((entry) => entry.year === selectedYear);
  const selectedEntry = selectedIndex >= 0 ? rows[selectedIndex] : rows[rows.length - 1];
  const priorEntry = selectedIndex > 0 ? rows[selectedIndex - 1] : null;
  const selectedValue = selectedEntry ? Number(selectedEntry[valueKey]) || 0 : 0;
  const priorValue = priorEntry ? Number(priorEntry[valueKey]) || 0 : null;
  const change = priorValue === null ? null : selectedValue - priorValue;
  const favourableChange = change === null ? true : lowerIsBetter ? change <= 0 : change >= 0;

  return (
    <div className={`trend-card trend-card-${accent}`}>
      <div className="trend-card-header">
        <div>
          <div className="flex items-center gap-2">
            <span className={`visual-dot visual-dot-${accent}`} />
            <h3 className="font-brand text-base text-slate-950 dark:text-white">{title}</h3>
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {selectedEntry ? `${selectedEntry.year} actual` : 'No selected season'}
          </p>
        </div>
        <div className="text-right">
          <strong className="block font-brand text-2xl text-slate-950 dark:text-white">{formatCurrency(selectedValue)}</strong>
          {change !== null && (
            <span className={favourableChange ? 'trend-delta-positive' : 'trend-delta-negative'}>
              {change >= 0 ? '+' : ''}{formatCurrency(change)} vs prior
            </span>
          )}
        </div>
      </div>

      <div className="trend-row-stack">
        {rows.map((entry) => {
          const value = Number(entry[valueKey]) || 0;
          const width = `${Math.max((Math.abs(value) / maxValue) * (signed ? 50 : 100), signed && value === 0 ? 0 : 3)}%`;
          const isActive = entry.year === selectedYear;

          return (
            <div key={`${title}-${entry.year}`} className={`trend-row ${isActive ? 'trend-row-active' : ''}`}>
              <span className="trend-row-year">{entry.year}</span>
              {signed ? (
                <div className="trend-track trend-track-signed">
                  <span className="trend-zero-line" />
                  <div
                    className={`trend-bar trend-bar-signed ${value < 0 ? 'trend-bar-negative trend-bar-left' : 'trend-bar-right'}`}
                    style={{ width }}
                  />
                </div>
              ) : (
                <div className="trend-track">
                  <div
                    className={`trend-bar ${value < 0 ? 'trend-bar-negative' : ''}`}
                    style={{ width }}
                  />
                </div>
              )}
              <strong>{formatCurrency(value)}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function shortCurrency(value) {
  const numeric = Number(value) || 0;
  if (Math.abs(numeric) >= 1000000) return `$${(numeric / 1000000).toFixed(1)}M`;
  if (Math.abs(numeric) >= 1000) return `$${Math.round(numeric / 1000)}k`;
  return `$${Math.round(numeric)}`;
}

function tooltipStyle() {
  return {
    borderRadius: '16px',
    border: '1px solid rgba(148, 163, 184, 0.35)',
    boxShadow: '0 16px 30px rgba(15, 23, 42, 0.12)',
  };
}

export default Graphs;
