import React from 'react';
import { FileDown } from 'lucide-react';
import TreasurersReport from './TreasurersReport';
import ProfitLossSummary from './ProfitLossSummary';
import KeyRevenueItems from './KeyRevenueItems';
import KeyExpenseItems from './KeyExpenseItems';
import Graphs from './Graphs';
import clubLogo from '../assets/images/mazenod-logo.png';
import {
  formatCurrency,
  getMetricForRows,
} from '../utils/financialUtils';

function AGMPack({ data, allData, selectedYear, openingBalance }) {
  const metrics = getMetricForRows(data);
  const closingBalance = openingBalance + metrics.actualProfit;
  const generatedDate = new Date().toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handleExport = () => {
    const originalTitle = document.title;
    document.title = `MOCCC AGM Financial Pack - ${selectedYear || 'Season'}`;
    const restoreTitle = () => {
      document.title = originalTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };
    window.addEventListener('afterprint', restoreTitle);
    window.print();
  };

  return (
      <div className="agm-pack-root">
        <div className="agm-pack-toolbar no-print">
          <div>
          <h2 className="font-brand text-2xl text-slate-950 dark:text-white">AGM Financial Pack</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Export a clean PDF pack containing the treasurer's report, P&amp;L, revenue commentary, expense commentary, and visuals.
          </p>
        </div>
        <button type="button" onClick={handleExport} className="export-pdf-button">
          <FileDown className="h-4 w-4" />
          Export PDF
        </button>
      </div>

      <div className="agm-print-root">
        <section className="agm-pack-page agm-first-page">
          <div className="agm-cover-page">
            <div className="agm-cover-main">
              <img src={clubLogo} alt="Mazenod Cricket Club" className="h-24 w-24 object-contain" />
              <div>
                <p className="agm-cover-kicker">Mazenod Old Collegians Cricket Club</p>
                <h1>AGM Financial Pack</h1>
                <p>Season {selectedYear || '-'} | Generated {generatedDate}</p>
              </div>
            </div>

            <div className="agm-cover-grid">
              <CoverMetric label="Revenues" value={formatCurrency(metrics.actualRevenue)} tone="green" />
              <CoverMetric label="Expenses" value={formatCurrency(metrics.actualExpense)} tone="blue" />
              <CoverMetric label="Net Profit (Loss)" value={formatCurrency(metrics.actualProfit)} tone={metrics.actualProfit < 0 ? 'red' : 'green'} />
              <CoverMetric label="Closing Cash" value={formatCurrency(closingBalance)} tone="orange" />
            </div>
          </div>

          <TreasurersReport data={data} selectedYear={selectedYear} />
        </section>

        <section className="agm-pack-page agm-commentary-page">
          <div className="agm-commentary-grid">
            <KeyRevenueItems selectedYear={selectedYear} />
            <KeyExpenseItems selectedYear={selectedYear} />
          </div>
        </section>

        <section className="agm-pack-page agm-financials-page">
          <ProfitLossSummary data={data} />

          <Graphs data={allData} selectedYear={selectedYear} printMode />
        </section>
      </div>
    </div>
  );
}

function CoverMetric({ label, value, tone }) {
  const toneClass =
    tone === 'red'
      ? 'text-rose-600 dark:text-rose-400'
      : tone === 'green'
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-slate-950 dark:text-white';

  return (
    <div className={`agm-cover-metric ${tone ? `agm-cover-metric-${tone}` : ''}`}>
      <span>{label}</span>
      <strong className={toneClass}>{value}</strong>
    </div>
  );
}

export default AGMPack;
