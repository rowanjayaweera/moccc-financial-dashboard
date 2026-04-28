import React, { useMemo, useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import {
  Calculator,
  Download,
  FileDown,
  FileText,
  Gauge,
  LineChart,
  Moon,
  RefreshCcw,
  ShieldCheck,
  Sun,
  Upload,
  Users,
} from 'lucide-react';
import './App.css';
import ProfitLossSummary from './components/ProfitLossSummary';
import DetailedBreakdown from './components/DetailedBreakdown';
import Graphs from './components/Graphs';
import TreasurersReport from './components/TreasurersReport';
import KeyRevenueItems from './components/KeyRevenueItems';
import KeyExpenseItems from './components/KeyExpenseItems';
import AGMPack from './components/AGMPack';
import BudgetPage from './components/BudgetPage';
import clubLogo from './assets/images/mazenod-logo.png';
import { SUBMITTED_BUDGET_ROWS } from './data/submittedBudgets';
import {
  BUDGET_FINALIZED_STORAGE_KEY,
  BUDGET_VALUES_STORAGE_KEY,
  CSV_FILE_STORAGE_KEY,
  CSV_STORAGE_KEY,
  LOCKED_BUDGET_YEARS,
  OPEN_BUDGET_YEAR,
  THEME_STORAGE_KEY,
  buildBudgetSeedValues,
  buildBudgetValuesFromRows,
  createBudgetRowsFromValues,
  getCashPositionForYear,
  getMetricForRows,
  getReportingYears,
  getYears,
  normalizeBudgetValues,
  normalizeRows,
  validateColumns,
  formatCurrency,
} from './utils/financialUtils';

const getInitialTab = () => {
  if (typeof window === 'undefined') return 'treasurer';
  return new URLSearchParams(window.location.search).get('tab') || 'treasurer';
};

const getRequestedYear = () => {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('year') || '';
};

const hasBudgetLineValues = (values = {}) =>
  Object.values(values || {}).some((value) => value && (value.type || value.Type));

const readStoredBudgetValues = () => {
  if (typeof window === 'undefined') return null;

  const storedBudgetValues = localStorage.getItem(BUDGET_VALUES_STORAGE_KEY);
  if (!storedBudgetValues) return null;

  try {
    return normalizeBudgetValues(JSON.parse(storedBudgetValues));
  } catch (error) {
    console.error('Error parsing stored budget values:', error);
    localStorage.removeItem(BUDGET_VALUES_STORAGE_KEY);
    return null;
  }
};

const readStoredBudgetFinalized = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(BUDGET_FINALIZED_STORAGE_KEY) === 'true';
};

function App() {
  const [financialData, setFinancialData] = useState([]);
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [selectedYear, setSelectedYear] = useState('');
  const [theme, setTheme] = useState('light');
  const [parseWarning, setParseWarning] = useState('');
  const [budgetValues, setBudgetValues] = useState(readStoredBudgetValues);
  const [budgetFinalized, setBudgetFinalized] = useState(readStoredBudgetFinalized);

  const setBudgetValuesAndPersist = useCallback((valueOrUpdater) => {
    setBudgetValues((current) => {
      const nextValue = typeof valueOrUpdater === 'function' ? valueOrUpdater(current) : valueOrUpdater;

      if (!nextValue) {
        localStorage.removeItem(BUDGET_VALUES_STORAGE_KEY);
        return nextValue;
      }

      const normalizedBudgetValues = normalizeBudgetValues(nextValue);
      localStorage.setItem(BUDGET_VALUES_STORAGE_KEY, JSON.stringify(normalizedBudgetValues));
      return normalizedBudgetValues;
    });
  }, []);

  const setBudgetFinalizedAndPersist = useCallback((valueOrUpdater) => {
    setBudgetFinalized((current) => {
      const nextValue = typeof valueOrUpdater === 'function' ? valueOrUpdater(current) : valueOrUpdater;
      localStorage.setItem(BUDGET_FINALIZED_STORAGE_KEY, String(nextValue));
      return nextValue;
    });
  }, []);

  const parseCSV = useCallback((csvText, options = {}) => {
    const { syncOpenBudget = true } = options;

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: function (results) {
        const missingColumns = validateColumns(results.data?.[0]);
        const normalized = normalizeRows(results.data || []);
        const dataYears = getYears(normalized);
        const reportingYears = getReportingYears(normalized);
        const uploadedOpenBudgetValues = buildBudgetValuesFromRows(normalized, OPEN_BUDGET_YEAR);
        const hasUploadedOpenBudget = Object.keys(uploadedOpenBudgetValues).length > 0;

        if (missingColumns.length > 0) {
          setParseWarning(`CSV is missing expected columns: ${missingColumns.join(', ')}`);
        } else {
          setParseWarning('');
        }

        setFinancialData(normalized);
        if (syncOpenBudget && hasUploadedOpenBudget) {
          setBudgetValuesAndPersist((current) => ({
            ...normalizeBudgetValues({
              ...(current?.__workpapers ? { __workpapers: current.__workpapers } : {}),
              ...uploadedOpenBudgetValues,
            }),
          }));
        }

        if (dataYears.length > 0) {
          const requestedYear = getRequestedYear();
          setSelectedYear((prev) =>
            prev && reportingYears.includes(prev)
              ? prev
              : requestedYear && reportingYears.includes(requestedYear)
                ? requestedYear
                : dataYears[dataYears.length - 1],
          );
        }
      },
    });
  }, [setBudgetValuesAndPersist]);

  const fetchRemoteCSV = useCallback(async (options = {}) => {
    try {
      const response = await fetch('https://raw.githubusercontent.com/rowjay29/moccc-financial-dashboard/master/MOCCC%20Financials.csv');
      const text = await response.text();
      parseCSV(text, options);
    } catch (error) {
      console.error('Error fetching remote CSV:', error);
      setParseWarning('Could not load sample data. Please upload your CSV file.');
    }
  }, [parseCSV]);

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === 'dark' || storedTheme === 'light') {
      setTheme(storedTheme);
    }

    const storedCSV = localStorage.getItem(CSV_STORAGE_KEY);
    const storedName = localStorage.getItem(CSV_FILE_STORAGE_KEY);
    const storedOpenBudgetValues = readStoredBudgetValues();
    const shouldSyncOpenBudgetFromCSV = !hasBudgetLineValues(storedOpenBudgetValues);

    if (storedCSV) {
      parseCSV(storedCSV, { syncOpenBudget: shouldSyncOpenBudgetFromCSV });
      if (!storedName) localStorage.removeItem(CSV_FILE_STORAGE_KEY);
    } else {
      fetchRemoteCSV({ syncOpenBudget: shouldSyncOpenBudgetFromCSV });
    }
  }, [fetchRemoteCSV, parseCSV]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (budgetValues) {
      const normalizedBudgetValues = normalizeBudgetValues(budgetValues);
      const currentBudgetValues = JSON.stringify(budgetValues);
      const normalizedBudgetValuesText = JSON.stringify(normalizedBudgetValues);

      if (currentBudgetValues !== normalizedBudgetValuesText) {
        setBudgetValues(normalizedBudgetValues);
        return;
      }

      localStorage.setItem(BUDGET_VALUES_STORAGE_KEY, normalizedBudgetValuesText);
    }
  }, [budgetValues]);

  useEffect(() => {
    localStorage.setItem(BUDGET_FINALIZED_STORAGE_KEY, String(budgetFinalized));
  }, [budgetFinalized]);

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
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

  const submittedFinancialData = useMemo(() => {
    const unlockedRows = financialData.filter((row) => !(row.IsBudget && LOCKED_BUDGET_YEARS.includes(row.Year)));
    return [...unlockedRows, ...normalizeRows(SUBMITTED_BUDGET_ROWS)];
  }, [financialData]);

  useEffect(() => {
    if (budgetValues || submittedFinancialData.length === 0) return;
    const uploadedOpenBudgetValues = buildBudgetValuesFromRows(submittedFinancialData, OPEN_BUDGET_YEAR);
    setBudgetValuesAndPersist(
      normalizeBudgetValues(
        Object.keys(uploadedOpenBudgetValues).length > 0
          ? uploadedOpenBudgetValues
          : buildBudgetSeedValues(submittedFinancialData, OPEN_BUDGET_YEAR),
      ),
    );
  }, [budgetValues, setBudgetValuesAndPersist, submittedFinancialData]);

  const openBudgetRows = useMemo(
    () => createBudgetRowsFromValues(OPEN_BUDGET_YEAR, budgetValues || {}),
    [budgetValues],
  );

  const reportingData = useMemo(() => {
    const nonOpenBudgetRows = submittedFinancialData.filter((row) => !(row.Year === OPEN_BUDGET_YEAR && row.IsBudget));
    return [...nonOpenBudgetRows, ...openBudgetRows];
  }, [openBudgetRows, submittedFinancialData]);

  const years = useMemo(() => getReportingYears(reportingData), [reportingData]);
  const filteredData = useMemo(() => reportingData.filter((row) => row.Year === selectedYear), [reportingData, selectedYear]);
  const metrics = useMemo(() => getMetricForRows(filteredData), [filteredData]);
  const cashPosition = useMemo(() => getCashPositionForYear(reportingData, selectedYear), [reportingData, selectedYear]);
  const openingBalance = cashPosition.openingBalance;
  const closingBalance = cashPosition.closingBalance;

  const revenueVariance = metrics.actualRevenue - metrics.budgetRevenue;
  const expenseVariance = metrics.actualExpense - metrics.budgetExpense;
  const netMovementVariance = metrics.actualProfit - metrics.budgetProfit;

  const tabs = [
    { label: 'Treasurer', key: 'treasurer' },
    { label: 'P&L', key: 'pl-summary' },
    { label: 'Breakdown', key: 'detailed-breakdown' },
    { label: 'Revenue', key: 'key-revenue' },
    { label: 'Expenses', key: 'key-expense' },
    { label: 'Visuals', key: 'graphs' },
  ];
  const showReportTabs = tabs.some((tab) => tab.key === activeTab);
  const isBudgetPage = activeTab === 'budget';

  return (
    <div className="moccc-app min-h-screen text-slate-950 transition-colors dark:text-slate-100">
      <TopBar theme={theme} setTheme={setTheme} />

      <div className="mx-auto flex max-w-[1440px] gap-6 px-4 py-6 md:px-6">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="min-w-0 flex-1">
          <section className="hub-shell">
            <header className="hub-shell-header no-print px-5 py-5 md:px-6">
              <div className="relative z-10 flex flex-col gap-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="brand-tile">
                      <img src={clubLogo} alt="Mazenod Cricket Club" className="h-11 w-11 object-contain" />
                    </div>
                    <div className="min-w-0">
                      <p className="eyebrow">Mazenod Old Collegians Cricket Club</p>
                      <h1 className="font-brand text-[2rem] tracking-tight text-slate-950 dark:text-white">
                        {isBudgetPage ? 'Budget' : 'Financial Report'}
                      </h1>
                    </div>
                  </div>

                </div>

                {showReportTabs && <nav aria-label="Financial dashboard sections" className="hub-tab-rail hub-compact-tab-rail no-print">
                  <div className="hub-scrollbar-hidden flex min-w-full items-stretch gap-1.5 overflow-x-auto">
                    {tabs.map((tab) => {
                      const active = activeTab === tab.key;
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          aria-current={active ? 'page' : undefined}
                          className={`hub-tab-button ${active ? 'hub-tab-button-active' : 'hub-tab-button-inactive'}`}
                          onClick={() => setActiveTab(tab.key)}
                        >
                          {active && <span className="hub-tab-button-pill" />}
                          <span className="relative z-10">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </nav>}

                <div className="report-control-bar">
                  <div className="report-control-left">
                    <label className="report-season-control">
                      <span className="hub-control-label hub-control-inline-label">Season</span>
                      <select
                        id="year-select"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="hub-select w-[112px]"
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="report-action-group">
                    <a href={`${process.env.PUBLIC_URL}/MOCCC-Financial-Template.csv`} download="MOCCC-Financial-Template.csv" className="hub-action-chip">
                      <Download className="h-4 w-4" />
                      Template
                    </a>
                    <label className="hub-action-chip cursor-pointer">
                      <Upload className="h-4 w-4" />
                      Upload CSV
                      <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
                    </label>
                    <button type="button" onClick={fetchRemoteCSV} className="hub-action-chip">
                      <RefreshCcw className="h-4 w-4" />
                      Reload sample
                    </button>
                  </div>
                </div>
              </div>
            </header>

            {parseWarning ? (
              <div className="mx-6 mt-6 rounded-[20px] border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200">
                {parseWarning}
              </div>
            ) : null}

            {!isBudgetPage && <div className="no-print border-b border-slate-200/70 p-5 dark:border-white/10 md:p-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  tone={revenueVariance >= 0 ? 'green' : 'red'}
                  label="Revenues"
                  value={formatCurrency(metrics.actualRevenue)}
                  status={revenueVariance >= 0 ? 'Tracking' : 'Below budget'}
                  budgetLabel="Revenue budget"
                  budgetValue={formatCurrency(metrics.budgetRevenue)}
                  details={[{ label: 'Variance', value: formatCurrency(revenueVariance), tone: revenueVariance >= 0 ? 'positive' : 'negative' }]}
                />
                <MetricCard
                  tone={expenseVariance <= 0 ? 'blue' : 'red'}
                  label="Expenses"
                  value={formatCurrency(metrics.actualExpense)}
                  status={expenseVariance <= 0 ? 'Tracking' : 'Over budget'}
                  budgetLabel="Expense budget"
                  budgetValue={formatCurrency(metrics.budgetExpense)}
                  details={[{ label: 'Variance', value: formatCurrency(expenseVariance), tone: expenseVariance <= 0 ? 'positive' : 'negative' }]}
                />
                <MetricCard
                  tone={netMovementVariance >= 0 ? 'green' : 'red'}
                  label="Net Profit"
                  value={formatCurrency(metrics.actualProfit)}
                  status={netMovementVariance >= 0 ? 'Tracking' : 'Under pressure'}
                  budgetLabel="Net profit budget"
                  budgetValue={formatCurrency(metrics.budgetProfit)}
                  details={[{ label: 'Variance', value: formatCurrency(netMovementVariance), tone: netMovementVariance >= 0 ? 'positive' : 'negative' }]}
                />
                <MetricCard
                  tone={closingBalance >= openingBalance ? 'green' : 'orange'}
                  label="Cash Position"
                  value={formatCurrency(closingBalance)}
                  status={closingBalance >= openingBalance ? 'Improving' : 'Watch'}
                  details={[
                    { label: 'Opening', value: formatCurrency(openingBalance) },
                    { label: 'Net movement', value: formatCurrency(metrics.actualProfit), tone: metrics.actualProfit >= 0 ? 'positive' : 'negative' },
                  ]}
                />
              </div>
            </div>}

            <div className="p-5 md:p-6">
              {filteredData.length === 0 && activeTab !== 'budget' ? (
                <div className="hub-panel-card p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  Upload a CSV and select a season to begin.
                </div>
              ) : (
                <div className="tab-content">
                  {activeTab === 'treasurer' && <TreasurersReport data={filteredData} selectedYear={selectedYear} />}
                  {activeTab === 'pl-summary' && <ProfitLossSummary data={filteredData} />}
                  {activeTab === 'detailed-breakdown' && <DetailedBreakdown data={filteredData} />}
                  {activeTab === 'graphs' && <Graphs data={reportingData} selectedYear={selectedYear} />}
                  {activeTab === 'key-revenue' && <KeyRevenueItems selectedYear={selectedYear} />}
                  {activeTab === 'key-expense' && <KeyExpenseItems selectedYear={selectedYear} />}
                  {activeTab === 'budget' && (
                    <BudgetPage
                      data={reportingData}
                      selectedYear={selectedYear}
                      budgetValues={budgetValues || {}}
                      setBudgetValues={setBudgetValuesAndPersist}
                      budgetFinalized={budgetFinalized}
                      setBudgetFinalized={setBudgetFinalizedAndPersist}
                    />
                  )}
                  {activeTab === 'agm-pack' && (
                    <AGMPack
                      data={filteredData}
                      allData={reportingData}
                      selectedYear={selectedYear}
                      openingBalance={openingBalance}
                    />
                  )}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function TopBar({ theme, setTheme }) {
  return (
    <div className="no-print sticky top-0 z-50 border-b border-slate-200/70 bg-white/88 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/82">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-2.5 md:px-6">
        <div className="flex items-center gap-3">
          <img src={clubLogo} alt="Mazenod Cricket Club" className="h-9 w-9 object-contain" />
          <span className="font-brandRound text-lg tracking-tight text-slate-950 dark:text-white">Mazenod O.C.C.C</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
            className="theme-toggle"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ activeTab, setActiveTab }) {
  const nav = [
    { label: 'Financial Report', icon: Gauge, tone: 'green', key: 'treasurer' },
    { label: 'AGM Pack', icon: FileDown, tone: 'blue', key: 'agm-pack' },
    { label: 'P&L Statement', icon: FileText, tone: 'blue', key: 'pl-summary' },
    { label: 'Revenue', icon: Users, tone: 'green', key: 'key-revenue' },
    { label: 'Expenses', icon: ShieldCheck, tone: 'red', key: 'key-expense' },
    { label: 'Breakdown', icon: FileText, tone: 'orange', key: 'detailed-breakdown' },
    { label: 'Visuals', icon: LineChart, tone: 'blue', key: 'graphs' },
    { label: 'Budget', icon: Calculator, tone: 'green', key: 'budget' },
  ];

  return (
    <aside className="no-print hidden w-[218px] shrink-0 lg:block">
      <nav className="sidebar-card">
        {nav.map(({ label, icon: Icon, tone, key }) => {
          const active = activeTab === key;

          return (
          <button
            key={label}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`sidebar-link ${active ? `sidebar-link-active sidebar-link-${tone}` : ''}`}
          >
            <span className={`sidebar-icon sidebar-icon-${tone}`}>
              <Icon className="h-[17px] w-[17px]" />
            </span>
            <span>{label}</span>
          </button>
          );
        })}
      </nav>
    </aside>
  );
}

function MetricCard({ tone = 'green', label, value, sub, status, budgetLabel, budgetValue, details = [] }) {
  const displayStatus = status || (tone === 'red' ? 'Under pressure' : tone === 'orange' ? 'Watch' : 'Tracking');
  return (
    <div className={`metric-card metric-card-${tone}`}>
      <div className="relative flex h-full flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="eyebrow">{label}</div>
            <div className="mt-3 font-brand text-3xl tracking-tight text-slate-950 dark:text-white">{value}</div>
            {sub ? <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{sub}</div> : null}
          </div>
          <span className={`metric-status metric-status-${tone}`}>{displayStatus}</span>
        </div>

        <div className="metric-card-details">
          {budgetLabel && (
            <div className="metric-detail-row metric-detail-budget">
              <span>{budgetLabel}</span>
              <strong>{budgetValue}</strong>
            </div>
          )}
          {details.map((detail) => (
            <div key={detail.label} className="metric-detail-row">
              <span>{detail.label}</span>
              <strong className={detail.tone ? `metric-detail-${detail.tone}` : undefined}>{detail.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
