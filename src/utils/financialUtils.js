export const CSV_STORAGE_KEY = 'moccc-financial-data';
export const CSV_FILE_STORAGE_KEY = 'moccc-financial-file-name';
export const THEME_STORAGE_KEY = 'moccc-theme';
export const OPEN_BUDGET_YEAR = '2025/26';
export const REPORTING_YEARS = ['2023/24', '2024/25', '2025/26'];
export const LOCKED_BUDGET_YEARS = ['2023/24', '2024/25'];
export const BUDGET_VALUES_STORAGE_KEY = 'moccc-2025-26-budget-values';
export const BUDGET_FINALIZED_STORAGE_KEY = 'moccc-2025-26-budget-finalized';
export const BASE_OPENING_CASH_YEAR = '2023/24';
export const BASE_OPENING_CASH_BALANCE = 46968;

const REQUIRED_COLUMNS = ['Year', 'Type', 'Category', 'Item', 'Amount'];

const BOOL_TRUE_VALUES = new Set([true, 'true', 'True', 'TRUE', 1, '1', 'yes', 'YES']);

const NORMALIZED_TYPE = {
  revenue: 'Revenue',
  expense: 'Expense',
};

const ITEM_LABEL_ALIASES = {
  'bar - food/drink': 'Bar - Food/Drinks',
  'bar - food/drinks': 'Bar - Food/Drinks',
};

const FUNCTIONS_CATEGORY = 'Functions, Bar & Food';
const SOCIAL_FUNCTIONS_ITEM = 'Social Functions';
const SUBSCRIPTIONS_CATEGORY = 'Subscriptions';
const LEGACY_SUBSCRIPTIONS_ITEM = 'Subscriptions';

const normalizeLabel = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).trim().replace(/\s+/g, ' ') || fallback;
};

export const normalizeItemLabel = (value, category = '') => {
  const label = normalizeLabel(value, 'Unspecified');
  const categoryLabel = normalizeLabel(category, '').toLowerCase();

  if (categoryLabel === FUNCTIONS_CATEGORY.toLowerCase() && label.toLowerCase() === 'functions') {
    return SOCIAL_FUNCTIONS_ITEM;
  }

  return ITEM_LABEL_ALIASES[label.toLowerCase()] || label;
};

const normalizeCategoryLabel = (value) => normalizeLabel(value, 'Uncategorised');

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
  const category = normalizeCategoryLabel(row.Category);

  return {
    ...row,
    Year: year,
    Type: normalizeType(row.Type),
    Category: category,
    Item: normalizeItemLabel(row.Item, category),
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

export const getReportingYears = (rows = []) =>
  [...new Set([...REPORTING_YEARS, ...getYears(rows)])]
    .sort((a, b) => `${a}`.localeCompare(`${b}`, undefined, { numeric: true }));

export const getPreviousReportingYear = (year, rows = []) => {
  const years = Array.isArray(rows) ? getReportingYears(rows) : REPORTING_YEARS;
  const index = years.indexOf(year);
  return index > 0 ? years[index - 1] : '';
};

const sum = (rows, predicate) =>
  rows.reduce((acc, row) => (predicate(row) ? acc + (Number(row.Amount) || 0) : acc), 0);

const variance = (actual, baseline) => actual - baseline;

export const isFavourableVariance = (varianceAmount, type) => {
  if (type === 'Expense') return varianceAmount <= 0;
  return varianceAmount >= 0;
};

export const getBudgetLineKey = ({ Type, type, Category, category, Item, item }) => {
  const normalizedCategory = normalizeCategoryLabel(Category || category || '');
  return [
    normalizeType(Type || type || ''),
    normalizedCategory,
    normalizeItemLabel(Item || item || '', normalizedCategory),
  ].join('|||');
};

export const normalizeBudgetValues = (values = {}) => {
  const normalized = Object.entries(values || {})
    .reduce((acc, [key, value]) => {
      const isBudgetLine = value && (value.type || value.Type) && (value.category || value.Category) && (value.item || value.Item);

      if (!isBudgetLine) {
        acc[key] = value;
        return acc;
      }

      const type = normalizeType(value.type || value.Type);
      const category = normalizeCategoryLabel(value.category || value.Category);
      const item = normalizeItemLabel(value.item || value.Item, category);
      const canonicalKey = getBudgetLineKey({ Type: type, Category: category, Item: item });

      acc[canonicalKey] = {
        type,
        category,
        item,
        amount: Number(value.amount ?? value.Amount) || 0,
      };

      return acc;
    }, {});

  const hasSubscriptionBuckets = Object.values(normalized).some((value) =>
    value?.type === 'Revenue'
    && value?.category === SUBSCRIPTIONS_CATEGORY
    && value?.item
    && value.item !== LEGACY_SUBSCRIPTIONS_ITEM,
  );

  if (hasSubscriptionBuckets) {
    delete normalized[getBudgetLineKey({
      Type: 'Revenue',
      Category: SUBSCRIPTIONS_CATEGORY,
      Item: LEGACY_SUBSCRIPTIONS_ITEM,
    })];
  }

  return normalized;
};

export const createBudgetRowsFromValues = (year, values = {}) =>
  Object.entries(normalizeBudgetValues(values))
    .filter(([, value]) => value && (value.type || value.Type) && (value.category || value.Category) && (value.item || value.Item))
    .map(([key, value]) => ({
      Year: year,
      Type: normalizeType(value.type || value.Type),
      Category: normalizeCategoryLabel(value.category || value.Category),
      Item: normalizeItemLabel(value.item || value.Item, normalizeCategoryLabel(value.category || value.Category)),
      Amount: Number(value.amount ?? value.Amount) || 0,
      IsActual: false,
      IsBudget: true,
      IsPriorYear: false,
      BudgetKey: key,
    }));

export const buildBudgetSeedValues = (rows = [], targetYear = OPEN_BUDGET_YEAR) => {
  const previousYear = getPreviousReportingYear(targetYear, rows);
  const preferredRows = rows.filter((row) => row.Year === previousYear && row.IsBudget);
  const fallbackRows = rows.filter((row) => row.Year === previousYear && row.IsActual);
  const sourceRows = preferredRows.length ? preferredRows : fallbackRows;

  return sourceRows.reduce((acc, row) => {
    const key = getBudgetLineKey(row);
    const existing = acc[key];
    const category = normalizeCategoryLabel(row.Category);

    acc[key] = {
      type: normalizeType(row.Type),
      category,
      item: normalizeItemLabel(row.Item, category),
      amount: (existing?.amount || 0) + (Number(row.Amount) || 0),
    };

    return acc;
  }, {});
};

export const buildBudgetValuesFromRows = (rows = [], targetYear = OPEN_BUDGET_YEAR) =>
  rows
    .filter((row) => row.Year === targetYear && row.IsBudget)
    .reduce((acc, row) => {
      const key = getBudgetLineKey(row);
      const existing = acc[key];
      const category = normalizeCategoryLabel(row.Category);

      acc[key] = {
        type: normalizeType(row.Type),
        category,
        item: normalizeItemLabel(row.Item, category),
        amount: (existing?.amount || 0) + (Number(row.Amount) || 0),
      };

      return acc;
    }, {});

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

export const getOpeningBalanceForYear = (
  rows = [],
  targetYear,
  baseOpeningBalance = BASE_OPENING_CASH_BALANCE,
) => {
  if (!targetYear) return baseOpeningBalance;

  const years = getYears(rows);
  const baseYearIndex = years.indexOf(BASE_OPENING_CASH_YEAR);
  const targetYearIndex = years.indexOf(targetYear);
  const rollForwardYears = baseYearIndex >= 0 ? years.slice(baseYearIndex) : years;

  if (baseYearIndex >= 0 && targetYearIndex >= 0 && targetYearIndex < baseYearIndex) {
    return baseOpeningBalance;
  }

  let openingBalance = baseOpeningBalance;

  for (const year of rollForwardYears) {
    if (year === targetYear) return openingBalance;
    openingBalance += getMetricForRows(rows.filter((row) => row.Year === year)).actualProfit;
  }

  return openingBalance;
};

export const getCashPositionForYear = (rows = [], targetYear) => {
  const scopedRows = rows.filter((row) => row.Year === targetYear);
  const metrics = getMetricForRows(scopedRows);
  const openingBalance = getOpeningBalanceForYear(rows, targetYear);

  return {
    openingBalance,
    netMovement: metrics.actualProfit,
    closingBalance: openingBalance + metrics.actualProfit,
    budgetClosingBalance: openingBalance + metrics.budgetProfit,
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

const PRESENTATION_CATEGORY_LABELS = {
  Revenue: {
    'Functions, Bar & Food': 'Functions & Bar',
    Subscriptions: 'Subscriptions',
    'Sponsors, Grants & Memberships': 'Sponsors',
    Other: 'Other',
  },
  Expense: {
    'Coach, Captain & Player Payments': 'Player Pymts',
    'Equipment, & Uniforms & Training': 'Equip. & Uniforms',
    'Functions, Bar & Food': 'Functions & Bar',
    'Game Day & Affiliation Fees': 'Game Day',
    Other: 'Other',
    'College and Sponsors': 'Other',
    'Reward and Recognition': 'Other',
  },
};

const PRESENTATION_CATEGORY_ORDER = {
  Revenue: ['Functions & Bar', 'Subscriptions', 'Sponsors', 'Other'],
  Expense: ['Player Pymts', 'Equip. & Uniforms', 'Functions & Bar', 'Game Day', 'Other'],
};

export const getPresentationCategoryMix = (rows = [], type) => {
  const labelMap = PRESENTATION_CATEGORY_LABELS[type] || {};
  const orderedLabels = PRESENTATION_CATEGORY_ORDER[type] || [];
  const totals = new Map();

  rows
    .filter((row) => row.Type === type && row.IsActual)
    .forEach((row) => {
      const label = labelMap[row.Category] || (orderedLabels.length ? 'Other' : row.Category);
      totals.set(label, (totals.get(label) || 0) + (Number(row.Amount) || 0));
    });

  const ordered = orderedLabels
    .map((name) => ({ name, value: totals.get(name) || 0 }))
    .filter((entry) => entry.value !== 0);

  const orderedSet = new Set(orderedLabels);
  const extras = [...totals.entries()]
    .filter(([name]) => !orderedSet.has(name))
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return [...ordered, ...extras];
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
