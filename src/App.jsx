import React, { useMemo, useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Moon, Sun, Upload, RefreshCcw, Download } from 'lucide-react';
import './App.css';
import Summary from './components/Summary';
import ProfitLossSummary from './components/ProfitLossSummary';
import DetailedBreakdown from './components/DetailedBreakdown';
import Graphs from './components/Graphs';
import TreasurersReport from './components/TreasurersReport';
import KeyRevenueItems from './components/KeyRevenueItems';
import KeyExpenseItems from './components/KeyExpenseItems';
import {
  CSV_FILE_STORAGE_KEY,
  CSV_STORAGE_KEY,
  OPENING_BALANCE_KEY,
  THEME_STORAGE_KEY,
  getMetricForRows,
  getYears,
  normalizeRows,
  validateColumns,
  formatCurrency,
} from './utils/financialUtils';

function App() {
  const [financialData, setFinancialData] = useState([]);
  const [activeTab, setActiveTab] = useState('treasurer');
  const [selectedYear, setSelectedYear] = useState('');
  const [fileName, setFileName] = useState('');
  const [theme, setTheme] = useState('light');
  const [openingBalance, setOpeningBalance] = useState(52067);
  const [parseWarning, setParseWarning] = useState('');

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === 'dark' || storedTheme === 'light') {
      setTheme(storedTheme);
    }

    const storedBalance = localStorage.getItem(OPENING_BALANCE_KEY);
    if (storedBalance && !Number.isNaN(Number(storedBalance))) {
      setOpeningBalance(Number(storedBalance));
    }

    const storedCSV = localStorage.getItem(CSV_STORAGE_KEY);
    const storedName = localStorage.getItem(CSV_FILE_STORAGE_KEY);

    if (storedCSV) {
      parseCSV(storedCSV);
      if (storedName) setFileName(storedName);
    } else {
      fetchRemoteCSV();
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(OPENING_BALANCE_KEY, String(openingBalance));
  }, [openingBalance]);

  const fetchRemoteCSV = async () => {
    try {
      const response = await fetch('https://raw.githubusercontent.com/rowjay29/moccc-financial-dashboard/master/MOCCC%20Financials.csv');
      const text = await response.text();
      parseCSV(text);
      setFileName('MOCCC Financials.csv (sample)');
    } catch (error) {
      console.error('Error fetching remote CSV:', error);
      setParseWarning('Could not load sample data. Please upload your CSV file.');
    }
  };

  const parseCSV = (csvText) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: function (results) {
        const missingColumns = validateColumns(results.data?.[0]);
        const normalized = normalizeRows(results.data || []);
        const years = getYears(normalized);

        if (missingColumns.length > 0) {
          setParseWarning(`CSV is missing expected columns: ${missingColumns.join(', ')}`);
        } else {
          setParseWarning('');
        }

        setFinancialData(normalized);

        if (years.length > 0 && (!selectedYear || !years.includes(selectedYear))) {
          setSelectedYear(years[years.length - 1]);
        }
      },
    });
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvText = event.target.result;
        localStorage.setItem(CSV_STORAGE_KEY, csvText);
        localStorage.setItem(CSV_FILE_STORAGE_KEY, file.name);
        parseCSV(csvText);
      };
      reader.readAsText(file);
    }
  };

  const years = useMemo(() => getYears(financialData), [financialData]);
  const filteredData = financialData.filter((row) => row.Year === selectedYear);
  const metrics = getMetricForRows(filteredData);
  const closingBalance = openingBalance + metrics.actualProfit;

  const tabs = [
    { label: "Treasurer's Report", key: 'treasurer' },
    { label: 'Summary Position', key: 'overview' },
    { label: 'P&L', key: 'pl-summary' },
    { label: 'Detailed Breakdown', key: 'detailed-breakdown' },
    { label: 'Key Revenue Items', key: 'key-revenue' },
    { label: 'Key Expense Items', key: 'key-expense' },
    { label: 'Graphs & Visuals', key: 'graphs' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-200 p-4 text-slate-900 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-white/50 bg-white/70 p-5 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Mazenod Old Collegians Cricket Club</p>
              <h1 className="text-2xl font-semibold md:text-4xl">Financial Dashboard & Reporting</h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Cash basis reporting pack | Year {selectedYear || '-'} | Source {fileName || 'Default template file'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-600 dark:bg-slate-800"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              {theme === 'light' ? 'Dark mode' : 'Light mode'}
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/40">
              <p className="text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Cash In</p>
              <p className="text-xl font-semibold">{formatCurrency(metrics.actualRevenue)}</p>
            </div>
            <div className="rounded-2xl bg-rose-50 p-4 dark:bg-rose-950/40">
              <p className="text-xs uppercase tracking-wider text-rose-700 dark:text-rose-300">Cash Out</p>
              <p className="text-xl font-semibold">{formatCurrency(metrics.actualExpense)}</p>
            </div>
            <div className="rounded-2xl bg-sky-50 p-4 dark:bg-sky-950/40">
              <p className="text-xs uppercase tracking-wider text-sky-700 dark:text-sky-300">Net Movement</p>
              <p className={`text-xl font-semibold ${metrics.actualProfit < 0 ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
                {formatCurrency(metrics.actualProfit)}
              </p>
            </div>
            <div className="rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-950/40">
              <p className="text-xs uppercase tracking-wider text-indigo-700 dark:text-indigo-300">Closing Balance</p>
              <p className="text-xl font-semibold">{formatCurrency(closingBalance)}</p>
            </div>
          </div>
        </div>

        <div className="mb-5 flex flex-col justify-between gap-4 rounded-2xl border border-white/50 bg-white/60 p-4 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 lg:flex-row">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="year-select" className="text-sm font-medium">Year</label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none dark:border-slate-600 dark:bg-slate-800"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <label htmlFor="opening-balance" className="ml-2 text-sm font-medium">Opening Cash</label>
            <input
              id="opening-balance"
              type="number"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(Number(e.target.value) || 0)}
              className="w-36 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none dark:border-slate-600 dark:bg-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`${process.env.PUBLIC_URL}/MOCCC-Financial-Template.csv`}
              download="MOCCC-Financial-Template.csv"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              <Download className="h-4 w-4" />
              Download template
            </a>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-600 dark:bg-slate-800">
              <Upload className="h-4 w-4" />
              Upload CSV
              <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
            </label>
            <button
              type="button"
              onClick={fetchRemoteCSV}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              <RefreshCcw className="h-4 w-4" />
              Reload sample
            </button>
          </div>
        </div>

        {parseWarning ? (
          <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            {parseWarning}
          </div>
        ) : null}

        <div className="mb-8 flex justify-center">
          <div className="inline-flex max-w-full flex-wrap justify-center rounded-2xl border border-white/70 bg-slate-900/90 p-1 dark:border-slate-700 dark:bg-slate-800">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`m-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.key
                    ? 'bg-white text-slate-900 shadow-md dark:bg-slate-100'
                    : 'text-slate-200 hover:bg-slate-700'
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <p className="text-center text-slate-600 dark:text-slate-400">Upload a CSV and select a year to begin.</p>
      ) : (
        <div className="mx-auto max-w-7xl">
          {activeTab === 'treasurer' && <TreasurersReport data={filteredData} />}
          {activeTab === 'overview' && <Summary data={filteredData} openingBalance={openingBalance} />}
          {activeTab === 'pl-summary' && <ProfitLossSummary data={filteredData} />}
          {activeTab === 'detailed-breakdown' && <DetailedBreakdown data={filteredData} />}
          {activeTab === 'graphs' && (
            <Graphs data={financialData} selectedYear={selectedYear} />
          )}
          {activeTab === 'key-revenue' && <KeyRevenueItems />}
          {activeTab === 'key-expense' && <KeyExpenseItems />}
        </div>
      )}
    </div>
  );
}

export default App;
