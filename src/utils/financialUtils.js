export const CSV_STORAGE_KEY = 'moccc-financial-data';
export const CSV_FILE_STORAGE_KEY = 'moccc-financial-file-name';
export const OPENING_BALANCE_KEY = 'moccc-opening-balance';
export const THEME_STORAGE_KEY = 'moccc-theme';

const REQUIRED_COLUMNS = ['Year', 'Type', 'Category', 'Item', 'Amount'];

const BOOL_TRUE_VALUES = new Set([true, 'true', 'True', 'TRUE', 1, '1', 'yes', 'YES']);

const NORMALIZED_TYPE = {
  revenue: 'Revenue',
  expense: 'Expense',
};

export const formatCurrency = (value) => {
  const numeric = Number(value) || 0;
  return numeric.toLocaleString('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export const formatPercent = (value) => {
  if (!Number.isFinite(value)) return '-';
  return `${value.toFixed(1)}%`;
};

const toBoolean = (value) => BOOL_TRUE_VALUES.has(value);

const normalizeType = (value) => {
  if (!value) return '';
  const normalized = NORMALIZED_TYPE[String(value).trim().toLowerCase()];
  return normalized || String(value).trim();
};

const normalizeRow = (row) => {
  const year = row.Year !== undefined && row.Year !== null ? String(row.Year).trim() : '';
  const amount = Number(row.Amount) || 0;

  return {
    ...row,
    Year: year,
    Type: normalizeType(row.Type),
    Category: row.Category ? String(row.Category).trim() : 'Uncategorised',
    Item: row.Item ? String(row.Item).trim() : 'Unspecified',
    Amount: amount,
    IsActual: toBoolean(row.IsActual),
    IsBudget: toBoolean(row.IsBudget),
    IsPriorYear: toBoolean(row.IsPriorYear),
  };
};

export const validateColumns = (firstRow = {}) => {
  const columns = Object.keys(firstRow);
  return REQUIRED_COLUMNS.filter((column) => !columns.includes(column));
};

export const normalizeRows = (rows = []) =>
  rows
    .map(normalizeRow)
    .filter((row) => row.Year && row.Type && Number.isFinite(row.Amount));

export const getYears = (rows = []) =>
  [...new Set(rows.map((row) => row.Year).filter(Boolean))]
    .sort((a, b) => `${a}`.localeCompare(`${b}`, undefined, { numeric: true }));

const sum = (rows, predicate) =>
  rows.reduce((acc, row) => (predicate(row) ? acc + (Number(row.Amount) || 0) : acc), 0);

const variance = (actual, baseline) => actual - baseline;

export const isFavourableVariance = (varianceAmount, type) => {
  if (type === 'Expense') return varianceAmount <= 0;
  return varianceAmount >= 0;
};

export const buildCategoryRows = (rows = [], type) => {
  const categories = [...new Set(rows.filter((row) => row.Type === type).map((row) => row.Category))];
  return categories.map((category) => {
    const scoped = rows.filter((row) => row.Type === type && row.Category === category);
    const actual = sum(scoped, (row) => row.IsActual);
    const budget = sum(scoped, (row) => row.IsBudget);
    const prior = sum(scoped, (row) => row.IsPriorYear);

    return {
      type,
      category,
      actual,
      budget,
      prior,
      varToBudget: variance(actual, budget),
      varToPrior: variance(actual, prior),
    };
  });
};

export const buildDetailedRows = (rows = [], type) => {
  const categories = [...new Set(rows.filter((row) => row.Type === type).map((row) => row.Category))];

  return categories.map((category) => {
    const scoped = rows.filter((row) => row.Type === type && row.Category === category);
    const items = [...new Set(scoped.map((row) => row.Item))];
    const itemRows = items.map((item) => {
      const itemRowsOnly = scoped.filter((row) => row.Item === item);
      const actual = sum(itemRowsOnly, (row) => row.IsActual);
      const budget = sum(itemRowsOnly, (row) => row.IsBudget);
      const prior = sum(itemRowsOnly, (row) => row.IsPriorYear);
      return {
        item,
        actual,
        budget,
        prior,
        varToBudget: variance(actual, budget),
        varToPrior: variance(actual, prior),
      };
    });

    const actualTotal = sum(scoped, (row) => row.IsActual);
    const budgetTotal = sum(scoped, (row) => row.IsBudget);
    const priorTotal = sum(scoped, (row) => row.IsPriorYear);

    return {
      type,
      category,
      items: itemRows,
      totals: {
        actual: actualTotal,
        budget: budgetTotal,
        prior: priorTotal,
        varToBudget: variance(actualTotal, budgetTotal),
        varToPrior: variance(actualTotal, priorTotal),
      },
    };
  });
};

export const getMetricForRows = (rows = []) => {
  const actualRevenue = sum(rows, (row) => row.Type === 'Revenue' && row.IsActual);
  const actualExpense = sum(rows, (row) => row.Type === 'Expense' && row.IsActual);
  const budgetRevenue = sum(rows, (row) => row.Type === 'Revenue' && row.IsBudget);
  const budgetExpense = sum(rows, (row) => row.Type === 'Expense' && row.IsBudget);
  const priorRevenue = sum(rows, (row) => row.Type === 'Revenue' && row.IsPriorYear);
  const priorExpense = sum(rows, (row) => row.Type === 'Expense' && row.IsPriorYear);

  const actualProfit = actualRevenue - actualExpense;
  const budgetProfit = budgetRevenue - budgetExpense;
  const priorProfit = priorRevenue - priorExpense;

  const margin = (profit, revenue) => (revenue === 0 ? NaN : (profit / revenue) * 100);

  return {
    actualRevenue,
    budgetRevenue,
    priorRevenue,
    actualExpense,
    budgetExpense,
    priorExpense,
    actualProfit,
    budgetProfit,
    priorProfit,
    marginActual: margin(actualProfit, actualRevenue),
    marginBudget: margin(budgetProfit, budgetRevenue),
    marginPrior: margin(priorProfit, priorRevenue),
  };
};

export const getTopCategories = (rows = [], type, count = 6) => {
  const categoryTotals = new Map();
  rows
    .filter((row) => row.Type === type && row.IsActual)
    .forEach((row) => {
      const current = categoryTotals.get(row.Category) || 0;
      categoryTotals.set(row.Category, current + row.Amount);
    });

  const sorted = [...categoryTotals.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const visible = sorted.slice(0, count);
  const remainder = sorted.slice(count).reduce((acc, item) => acc + item.value, 0);
  if (remainder > 0) visible.push({ name: 'Other', value: remainder });
  return visible;
};

export const getYearSeries = (rows = [], metric = 'Revenue') => {
  const years = getYears(rows);
  return years.map((year) => {
    const yearRows = rows.filter((row) => row.Year === year && row.IsActual);
    const revenue = sum(yearRows, (row) => row.Type === 'Revenue');
    const expense = sum(yearRows, (row) => row.Type === 'Expense');
    const profit = revenue - expense;

    return {
      year,
      Revenue: revenue,
      Expense: expense,
      Profit: profit,
      value: metric === 'Profit' ? profit : metric === 'Expense' ? expense : revenue,
    };
  });
};
