import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, LockKeyhole, PencilLine, Plus, Trash2 } from 'lucide-react';
import {
  OPEN_BUDGET_YEAR,
  createBudgetRowsFromValues,
  formatCurrency,
  formatPercent,
  getBudgetLineKey,
  getMetricForRows,
  getPreviousReportingYear,
  isFavourableVariance,
  normalizeBudgetValues,
} from '../utils/financialUtils';

const WORKPAPER_STORE_KEY = '__workpapers';

const WORKPAPER_TABS = [
  { key: 'pl', label: 'P&L Budget' },
  { key: 'subscriptions', label: 'Subscriptions' },
  { key: 'sponsorships', label: 'Sponsors & Grants' },
  { key: 'functions', label: 'Functions' },
  { key: 'player-payments', label: 'Player Payments' },
];

const FUNCTIONS_CATEGORY = 'Functions, Bar & Food';
const SOCIAL_FUNCTIONS_ITEM = 'Social Functions';
const LEGACY_FUNCTIONS_ITEM = 'Functions';
const SUBSCRIPTIONS_CATEGORY = 'Subscriptions';
const LEGACY_SUBSCRIPTIONS_ITEM = 'Subscriptions';

function BudgetPage({
  data,
  selectedYear,
  budgetValues,
  setBudgetValues,
  budgetFinalized,
  setBudgetFinalized,
}) {
  const previousYear = getPreviousReportingYear(selectedYear, data);
  const [activeWorkpaper, setActiveWorkpaper] = useState('pl');
  const editable = selectedYear === OPEN_BUDGET_YEAR && !budgetFinalized;
  const openBudgetYear = selectedYear === OPEN_BUDGET_YEAR;

  useEffect(() => {
    if (!budgetValues || budgetValues[WORKPAPER_STORE_KEY]) return;

    const defaultWorkpapers = createDefaultWorkpapers();
    const hasBudgetLines = Object.values(budgetValues).some((value) => value?.type || value?.Type);
    setBudgetValues((current) =>
      hasBudgetLines ? {
        ...(current || {}),
        [WORKPAPER_STORE_KEY]: defaultWorkpapers,
      } : syncAllWorkpaperBudgets({
        ...(current || {}),
        [WORKPAPER_STORE_KEY]: defaultWorkpapers,
      }, defaultWorkpapers),
    );
  }, [budgetValues, setBudgetValues]);

  const workpapers = useMemo(
    () => budgetValues?.[WORKPAPER_STORE_KEY] || createDefaultWorkpapers(),
    [budgetValues],
  );
  const budgetRows = useMemo(
    () => (openBudgetYear ? createBudgetRowsFromValues(selectedYear, budgetValues || {}) : data.filter((row) => row.Year === selectedYear && row.IsBudget)),
    [budgetValues, data, openBudgetYear, selectedYear],
  );
  const budgetModel = useMemo(
    () => buildBudgetModel(data, selectedYear, previousYear, budgetRows),
    [budgetRows, data, previousYear, selectedYear],
  );
  const workpaperLines = useMemo(
    () => getWorkpaperLines(budgetModel.lines, activeWorkpaper),
    [activeWorkpaper, budgetModel.lines],
  );

  const handleBudgetChange = (line, value) => {
    const amount = toNumber(value);
    setBudgetValues((current) => normalizeBudgetValues({
      ...(current || {}),
      [line.key]: {
        type: line.type,
        category: line.category,
        item: line.item,
        amount,
      },
    }));
  };

  const updateWorkpapers = (updater, syncKey) => {
    setBudgetValues((current) => {
      const currentWorkpapers = deepClone(current?.[WORKPAPER_STORE_KEY] || createDefaultWorkpapers());
      const nextWorkpapers = updater(currentWorkpapers);
      return normalizeBudgetValues(syncWorkpaperBudget({
        ...(current || {}),
        [WORKPAPER_STORE_KEY]: nextWorkpapers,
      }, syncKey, nextWorkpapers));
    });
  };

  return (
    <section className="statement-card p-5">
      <div className="budget-toolbar">
        <div>
          <p className="eyebrow">Budget planning</p>
          <h2 className="mt-1 font-brand text-xl text-slate-950 dark:text-white">
            P&amp;L Budget - {selectedYear || '-'}
          </h2>
        </div>

        <div className="budget-actions">
          {openBudgetYear ? (
            budgetFinalized ? (
              <>
                <span className="budget-status-pill budget-status-locked">
                  <LockKeyhole className="h-3.5 w-3.5" />
                  Finalized
                </span>
                <button type="button" onClick={() => setBudgetFinalized(false)} className="hub-action-chip">
                  <PencilLine className="h-4 w-4" />
                  Open budget
                </button>
              </>
            ) : (
              <>
                <span className="budget-status-pill budget-status-open">
                  <PencilLine className="h-3.5 w-3.5" />
                  Editable draft
                </span>
                <button type="button" onClick={() => setBudgetFinalized(true)} className="hub-action-chip">
                  <LockKeyhole className="h-4 w-4" />
                  Finalize budget
                </button>
              </>
            )
          ) : (
            <span className="budget-status-pill budget-status-locked">
              <LockKeyhole className="h-3.5 w-3.5" />
              Submitted budget locked
            </span>
          )}
        </div>
      </div>

      <nav aria-label="Budget workpapers" className="hub-tab-rail budget-workpaper-rail no-print">
        <div className="hub-scrollbar-hidden flex min-w-full items-stretch gap-1.5 overflow-x-auto">
          {WORKPAPER_TABS.map((tab) => {
            const active = activeWorkpaper === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                aria-current={active ? 'page' : undefined}
                className={`hub-tab-button ${active ? 'hub-tab-button-active' : 'hub-tab-button-inactive'}`}
                onClick={() => setActiveWorkpaper(tab.key)}
              >
                {active && <span className="hub-tab-button-pill" />}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {activeWorkpaper === 'pl' ? (
        <BudgetProfitAndLoss
          budgetModel={budgetModel}
          editable={editable}
          onBudgetChange={handleBudgetChange}
          previousYear={previousYear}
        />
      ) : openBudgetYear ? (
        <CalculatorWorkpaper
          activeWorkpaper={activeWorkpaper}
          editable={editable}
          previousYear={previousYear}
          selectedYear={selectedYear}
          updateWorkpapers={updateWorkpapers}
          workpapers={workpapers}
        />
      ) : (
        <WorkpaperView
          activeWorkpaper={activeWorkpaper}
          editable={false}
          lines={workpaperLines}
          onBudgetChange={handleBudgetChange}
          previousYear={previousYear}
          selectedYear={selectedYear}
        />
      )}
    </section>
  );
}

function BudgetProfitAndLoss({ budgetModel, editable, onBudgetChange, previousYear }) {
  return (
    <>
      <div className="budget-summary-grid">
        <BudgetSummary label="Revenue budget" value={formatCurrency(budgetModel.metrics.budgetRevenue)} />
        <BudgetSummary label="Expense budget" value={formatCurrency(budgetModel.metrics.budgetExpense)} />
        <BudgetSummary label="Net profit budget" value={formatCurrency(budgetModel.metrics.budgetProfit)} tone={budgetModel.metrics.budgetProfit >= 0 ? 'positive' : 'negative'} />
        <BudgetSummary label="Prior year net profit" value={formatCurrency(budgetModel.metrics.priorProfit)} />
      </div>

      <div className="statement-table-frame overflow-auto rounded-[22px] border border-slate-200/70 bg-white/80 dark:border-white/10 dark:bg-white/[0.03]">
        <table className="statement-table min-w-[980px]">
          <thead>
            <tr>
              <th className="text-left">Item</th>
              <th className="text-right">Budget</th>
              <th className="text-right">{previousYear ? `${previousYear} Actual` : 'Prior Year'}</th>
              <th className="text-right">Variance</th>
            </tr>
          </thead>
          <tbody>
            <GroupTitle title="Revenue" />
            {budgetModel.revenueGroups.map((group) => (
              <CategoryGroup
                key={`revenue-${group.category}`}
                group={group}
                editable={editable}
                onBudgetChange={onBudgetChange}
              />
            ))}
            <BudgetTotalRow
              label="TOTAL REVENUES"
              budget={budgetModel.metrics.budgetRevenue}
              prior={budgetModel.metrics.priorRevenue}
              type="Revenue"
            />

            <SpacerRow />

            <GroupTitle title="Expense" />
            {budgetModel.expenseGroups.map((group) => (
              <CategoryGroup
                key={`expense-${group.category}`}
                group={group}
                editable={editable}
                onBudgetChange={onBudgetChange}
              />
            ))}
            <BudgetTotalRow
              label="TOTAL EXPENSES"
              budget={budgetModel.metrics.budgetExpense}
              prior={budgetModel.metrics.priorExpense}
              type="Expense"
            />

            <SpacerRow />

            <BudgetTotalRow
              label="Net Profit (Loss)"
              budget={budgetModel.metrics.budgetProfit}
              prior={budgetModel.metrics.priorProfit}
              type="Revenue"
              final
            />
            <tr className="detail-margin-row">
              <td>Net Profit Margin</td>
              <td className="text-right tabular-nums">{formatPercent(budgetModel.metrics.marginBudget)}</td>
              <td className="text-right tabular-nums">{formatPercent(budgetModel.metrics.marginPrior)}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

function BudgetTotalRow({ label, budget, prior, type, final = false }) {
  return (
    <tr className={final ? 'detail-net-row' : 'detail-grand-total-row'}>
      <td className="text-slate-950 dark:text-white">{label}</td>
      <td className="text-right tabular-nums text-slate-950 dark:text-white">{formatCurrency(budget)}</td>
      <td className="text-right tabular-nums text-slate-500 dark:text-slate-400">{formatCurrency(prior)}</td>
      <VarianceCell value={budget - prior} type={type} />
    </tr>
  );
}

function SpacerRow() {
  return (
    <tr className="statement-spacer-row">
      <td colSpan="4" />
    </tr>
  );
}

function CalculatorWorkpaper({ activeWorkpaper, editable, previousYear, selectedYear, updateWorkpapers, workpapers }) {
  if (activeWorkpaper === 'subscriptions') {
    return (
      <SubscriptionsWorkpaper
        editable={editable}
        previousYear={previousYear}
        selectedYear={selectedYear}
        subscriptions={workpapers.subscriptions}
        updateWorkpapers={updateWorkpapers}
      />
    );
  }

  if (activeWorkpaper === 'functions') {
    return (
      <FunctionsWorkpaper
        editable={editable}
        functions={workpapers.functions}
        previousYear={previousYear}
        selectedYear={selectedYear}
        updateWorkpapers={updateWorkpapers}
      />
    );
  }

  if (activeWorkpaper === 'sponsorships') {
    return (
      <SponsorsWorkpaper
        editable={editable}
        previousYear={previousYear}
        selectedYear={selectedYear}
        sponsorships={workpapers.sponsorships}
        updateWorkpapers={updateWorkpapers}
      />
    );
  }

  if (activeWorkpaper === 'player-payments') {
    return (
      <PlayerPaymentsWorkpaper
        editable={editable}
        playerPayments={workpapers.playerPayments}
        previousYear={previousYear}
        selectedYear={selectedYear}
        updateWorkpapers={updateWorkpapers}
      />
    );
  }

  return null;
}

function SubscriptionsWorkpaper({ editable, previousYear, selectedYear, subscriptions, updateWorkpapers }) {
  const totalPlayers = subscriptions.sections.reduce((sum, section) => sum + section.rows.reduce((rowSum, row) => rowSum + toNumber(row.players), 0), 0);
  const grandTotal = calculateSubscriptionsTotal(subscriptions);

  const updateRow = (sectionId, rowId, field, value) => {
    updateWorkpapers((workpapers) => {
      workpapers.subscriptions.sections = workpapers.subscriptions.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              rows: section.rows.map((row) =>
                row.id === rowId
                  ? { ...row, [field]: field === 'feeType' ? value : toNumber(value) }
                  : row,
              ),
            }
          : section,
      );
      return workpapers;
    }, 'subscriptions');
  };

  return (
    <div className="workpaper-panel">
      <WorkpaperHeader title="Subscriptions" selectedYear={selectedYear} previousYear={previousYear} />
      <div className="workpaper-summary-grid">
        <BudgetSummary label="Grand total" value={formatCurrency(grandTotal)} tone="positive" />
        <BudgetSummary label="Total players" value={String(totalPlayers)} />
      </div>

      <div className="workpaper-sheet-grid">
        {subscriptions.sections.map((section) => {
          const sectionPlayers = section.rows.reduce((sum, row) => sum + toNumber(row.players), 0);
          const sectionTotal = section.rows.reduce((sum, row) => sum + lineTotal(row), 0);

          return (
            <div key={section.id} className="workpaper-sheet">
              <div className="workpaper-sheet-title">{section.title}</div>
              <table className="workpaper-table">
                <thead>
                  <tr>
                    <th>Fee Type</th>
                    <th className="text-right">Price</th>
                    <th className="text-right"># of Players</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row) => (
                    <tr key={row.id}>
                      <td>{editable ? <TextInput value={row.feeType} onChange={(value) => updateRow(section.id, row.id, 'feeType', value)} /> : row.feeType}</td>
                      <td className="text-right"><MoneyInput disabled={!editable} value={row.price} onChange={(value) => updateRow(section.id, row.id, 'price', value)} /></td>
                      <td className="text-right"><NumberInput disabled={!editable} value={row.players} onChange={(value) => updateRow(section.id, row.id, 'players', value)} /></td>
                      <td className="text-right tabular-nums font-semibold">{formatCurrency(lineTotal(row))}</td>
                    </tr>
                  ))}
                  <tr className="workpaper-total-row">
                    <td>Total</td>
                    <td />
                    <td className="text-right tabular-nums">{sectionPlayers}</td>
                    <td className="text-right tabular-nums">{formatCurrency(sectionTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      <GrandTotal label="Subscriptions Grand Total" secondary={`${totalPlayers} players`} value={grandTotal} />
    </div>
  );
}

function FunctionsWorkpaper({ editable, functions, previousYear, selectedYear, updateWorkpapers }) {
  const totals = calculateFunctionsTotals(functions);

  const updateFunctionName = (functionId, value) => {
    updateWorkpapers((workpapers) => {
      workpapers.functions.items = workpapers.functions.items.map((item) =>
        item.id === functionId ? { ...item, name: value } : item,
      );
      return workpapers;
    }, 'functions');
  };

  const updateLine = (functionId, side, lineId, field, value) => {
    updateWorkpapers((workpapers) => {
      workpapers.functions.items = workpapers.functions.items.map((item) =>
        item.id === functionId
          ? {
              ...item,
              [side]: item[side].map((line) =>
                line.id === lineId
                  ? { ...line, [field]: field === 'label' ? value : toNumber(value) }
                  : line,
              ),
            }
          : item,
      );
      return workpapers;
    }, 'functions');
  };

  const addFunction = () => {
    updateWorkpapers((workpapers) => {
      workpapers.functions.items = [
        ...workpapers.functions.items,
        {
          id: makeId('function'),
          name: 'New Function',
          revenueLines: [{ id: makeId('revenue'), label: 'Ticket Sales', price: 0, quantity: 0 }],
          expenseLines: [{ id: makeId('expense'), label: 'Other', price: 0, quantity: 0 }],
        },
      ];
      return workpapers;
    }, 'functions');
  };

  const removeFunction = (functionId) => {
    updateWorkpapers((workpapers) => {
      workpapers.functions.items = workpapers.functions.items.filter((item) => item.id !== functionId);
      return workpapers;
    }, 'functions');
  };

  const addLine = (functionId, side) => {
    updateWorkpapers((workpapers) => {
      workpapers.functions.items = workpapers.functions.items.map((item) =>
        item.id === functionId
          ? {
              ...item,
              [side]: [
                ...item[side],
                { id: makeId(side), label: side === 'revenueLines' ? 'Other' : 'Other', price: 0, quantity: 0 },
              ],
            }
          : item,
      );
      return workpapers;
    }, 'functions');
  };

  const removeLine = (functionId, side, lineId) => {
    updateWorkpapers((workpapers) => {
      workpapers.functions.items = workpapers.functions.items.map((item) =>
        item.id === functionId
          ? { ...item, [side]: item[side].filter((line) => line.id !== lineId) }
          : item,
      );
      return workpapers;
    }, 'functions');
  };

  return (
    <div className="workpaper-panel">
      <WorkpaperHeader title="Functions" selectedYear={selectedYear} previousYear={previousYear}>
        {editable && <ActionButton icon={Plus} label="Add function" onClick={addFunction} />}
      </WorkpaperHeader>
      <div className="workpaper-summary-grid">
        <BudgetSummary label="Revenue" value={formatCurrency(totals.revenue)} />
        <BudgetSummary label="Expense" value={formatCurrency(totals.expense)} />
        <BudgetSummary label="Profit / loss" value={formatCurrency(totals.net)} tone={totals.net >= 0 ? 'positive' : 'negative'} />
      </div>

      <div className="workpaper-sheet-grid">
        {functions.items.map((item) => {
          const revenueTotal = calculateFunctionLineTotal(item.revenueLines);
          const expenseTotal = calculateFunctionLineTotal(item.expenseLines);
          const net = revenueTotal - expenseTotal;

          return (
            <div key={item.id} className="workpaper-sheet">
              <div className="workpaper-sheet-title workpaper-sheet-title-action">
                {editable ? <TextInput value={item.name} onChange={(value) => updateFunctionName(item.id, value)} /> : item.name}
                {editable && <IconButton label="Remove function" icon={Trash2} onClick={() => removeFunction(item.id)} />}
              </div>
              <FunctionLineTable
                editable={editable}
                lines={item.revenueLines}
                onAddLine={() => addLine(item.id, 'revenueLines')}
                onRemoveLine={(lineId) => removeLine(item.id, 'revenueLines', lineId)}
                onUpdateLine={(lineId, field, value) => updateLine(item.id, 'revenueLines', lineId, field, value)}
                title="Revenue"
              />
              <FunctionLineTable
                editable={editable}
                lines={item.expenseLines}
                onAddLine={() => addLine(item.id, 'expenseLines')}
                onRemoveLine={(lineId) => removeLine(item.id, 'expenseLines', lineId)}
                onUpdateLine={(lineId, field, value) => updateLine(item.id, 'expenseLines', lineId, field, value)}
                title="Expense"
              />
              <GrandTotal label="Function Profit / Loss" value={net} compact />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FunctionLineTable({ editable, lines, onAddLine, onRemoveLine, onUpdateLine, title }) {
  const total = calculateFunctionLineTotal(lines);

  return (
    <div className="workpaper-subsection">
      <div className="workpaper-subsection-heading">
        <span>{title}</span>
        {editable && <ActionButton icon={Plus} label="Add line" onClick={onAddLine} small />}
      </div>
      <table className="workpaper-table">
        <thead>
          <tr>
            <th>Revenue / Expense</th>
            <th className="text-right">Price</th>
            <th className="text-right"># of Payees</th>
            <th className="text-right">Total</th>
            {editable && <th />}
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.id}>
              <td>{editable ? <TextInput value={line.label} onChange={(value) => onUpdateLine(line.id, 'label', value)} /> : line.label}</td>
              <td className="text-right"><MoneyInput disabled={!editable} value={line.price} onChange={(value) => onUpdateLine(line.id, 'price', value)} /></td>
              <td className="text-right"><NumberInput disabled={!editable} value={line.quantity} onChange={(value) => onUpdateLine(line.id, 'quantity', value)} /></td>
              <td className="text-right tabular-nums font-semibold">{formatCurrency(lineTotal(line, 'quantity'))}</td>
              {editable && (
                <td className="w-10 text-right">
                  <IconButton label="Remove line" icon={Trash2} onClick={() => onRemoveLine(line.id)} />
                </td>
              )}
            </tr>
          ))}
          <tr className="workpaper-total-row">
            <td>Total</td>
            <td />
            <td />
            <td className="text-right tabular-nums">{formatCurrency(total)}</td>
            {editable && <td />}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function SponsorsWorkpaper({ editable, previousYear, selectedYear, sponsorships, updateWorkpapers }) {
  const sponsorTotal = sponsorships.sponsors.reduce((sum, row) => sum + toNumber(row.amount), 0);
  const grantTotal = sponsorships.grants.reduce((sum, row) => sum + toNumber(row.amount), 0);

  const updateRow = (section, rowId, field, value) => {
    updateWorkpapers((workpapers) => {
      workpapers.sponsorships[section] = workpapers.sponsorships[section].map((row) =>
        row.id === rowId ? { ...row, [field]: field === 'name' ? value : toNumber(value) } : row,
      );
      return workpapers;
    }, 'sponsorships');
  };

  const addRow = (section) => {
    updateWorkpapers((workpapers) => {
      workpapers.sponsorships[section] = [
        ...workpapers.sponsorships[section],
        { id: makeId(section), name: section === 'sponsors' ? 'New sponsor' : 'New grant', amount: 0 },
      ];
      return workpapers;
    }, 'sponsorships');
  };

  const removeRow = (section, rowId) => {
    updateWorkpapers((workpapers) => {
      workpapers.sponsorships[section] = workpapers.sponsorships[section].filter((row) => row.id !== rowId);
      return workpapers;
    }, 'sponsorships');
  };

  return (
    <div className="workpaper-panel">
      <WorkpaperHeader title="Sponsorships, Grants & Memberships" selectedYear={selectedYear} previousYear={previousYear} />
      <div className="workpaper-summary-grid">
        <BudgetSummary label="Sponsors" value={formatCurrency(sponsorTotal)} />
        <BudgetSummary label="Grants" value={formatCurrency(grantTotal)} />
        <BudgetSummary label="Total" value={formatCurrency(sponsorTotal + grantTotal)} tone="positive" />
      </div>

      <div className="workpaper-sheet-grid workpaper-sheet-grid-two">
        <SimpleAmountSection
          addLabel="Add sponsor"
          editable={editable}
          onAdd={() => addRow('sponsors')}
          onRemove={(rowId) => removeRow('sponsors', rowId)}
          onUpdate={(rowId, field, value) => updateRow('sponsors', rowId, field, value)}
          rows={sponsorships.sponsors}
          title="Sponsor Entity"
        />
        <SimpleAmountSection
          addLabel="Add grant"
          editable={editable}
          onAdd={() => addRow('grants')}
          onRemove={(rowId) => removeRow('grants', rowId)}
          onUpdate={(rowId, field, value) => updateRow('grants', rowId, field, value)}
          rows={sponsorships.grants}
          title="Grantee"
        />
      </div>
    </div>
  );
}

function PlayerPaymentsWorkpaper({ editable, playerPayments, previousYear, selectedYear, updateWorkpapers }) {
  const total = playerPayments.rows.reduce((sum, row) => sum + toNumber(row.amount), 0);

  const updateRow = (rowId, field, value) => {
    updateWorkpapers((workpapers) => {
      workpapers.playerPayments.rows = workpapers.playerPayments.rows.map((row) =>
        row.id === rowId
          ? { ...row, [field]: field === 'name' ? value : toNumber(value), ...(field === 'name' ? { budgetItem: '' } : {}) }
          : row,
      );
      return workpapers;
    }, 'player-payments');
  };

  const addRow = () => {
    updateWorkpapers((workpapers) => {
      workpapers.playerPayments.rows = [
        ...workpapers.playerPayments.rows,
        { id: makeId('payment'), name: 'New expense item', amount: 0 },
      ];
      return workpapers;
    }, 'player-payments');
  };

  const removeRow = (rowId) => {
    updateWorkpapers((workpapers) => {
      workpapers.playerPayments.rows = workpapers.playerPayments.rows.filter((row) => row.id !== rowId);
      return workpapers;
    }, 'player-payments');
  };

  return (
    <div className="workpaper-panel">
      <WorkpaperHeader title="Player Payments" selectedYear={selectedYear} previousYear={previousYear}>
        {editable && <ActionButton icon={Plus} label="Add expense item" onClick={addRow} />}
      </WorkpaperHeader>
      <div className="workpaper-summary-grid">
        <BudgetSummary label="Player payments budget" value={formatCurrency(total)} tone="negative" />
      </div>

      <div className="workpaper-sheet-grid workpaper-sheet-grid-two">
        <SimpleAmountSection
          editable={editable}
          nameHeader="Name / Reason"
          onRemove={removeRow}
          onUpdate={updateRow}
          rows={playerPayments.rows}
          title="Expense"
        />
      </div>
    </div>
  );
}

function SimpleAmountSection({ addLabel, editable, nameHeader = 'Revenue / Expense', onAdd, onRemove, onUpdate, rows, title }) {
  const total = rows.reduce((sum, row) => sum + toNumber(row.amount), 0);

  return (
    <div className="workpaper-sheet">
      <div className="workpaper-sheet-title workpaper-sheet-title-action">
        <span>{title}</span>
        {editable && onAdd && <ActionButton icon={Plus} label={addLabel} onClick={onAdd} small />}
      </div>
      <table className="workpaper-table">
        <thead>
          <tr>
            <th>{nameHeader}</th>
            <th className="text-right">Total</th>
            {editable && <th />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{editable ? <TextInput value={row.name} onChange={(value) => onUpdate(row.id, 'name', value)} /> : row.name}</td>
              <td className="text-right"><MoneyInput disabled={!editable} value={row.amount} onChange={(value) => onUpdate(row.id, 'amount', value)} /></td>
              {editable && (
                <td className="w-10 text-right">
                  <IconButton label="Remove row" icon={Trash2} onClick={() => onRemove(row.id)} />
                </td>
              )}
            </tr>
          ))}
          <tr className="workpaper-total-row">
            <td>Total</td>
            <td className="text-right tabular-nums">{formatCurrency(total)}</td>
            {editable && <td />}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function WorkpaperHeader({ children, previousYear, selectedYear, title }) {
  return (
    <div className="workpaper-header">
      <div>
        <p className="eyebrow">Budget workpaper</p>
        <h3 className="mt-1 font-brand text-xl text-slate-950 dark:text-white">{title}</h3>
      </div>
      <div className="workpaper-meta">
        <span>{selectedYear || '-'}</span>
        <span>{previousYear ? `${previousYear} actual` : 'No prior year'}</span>
        {children}
      </div>
    </div>
  );
}

function WorkpaperView({ activeWorkpaper, editable, lines, onBudgetChange, previousYear, selectedYear }) {
  const tab = WORKPAPER_TABS.find((item) => item.key === activeWorkpaper);
  const summary = lines.reduce(
    (acc, line) => {
      if (line.type === 'Revenue') {
        acc.budgetRevenue += line.budget;
        acc.priorRevenue += line.prior;
      }

      if (line.type === 'Expense') {
        acc.budgetExpense += line.budget;
        acc.priorExpense += line.prior;
      }

      return acc;
    },
    { budgetRevenue: 0, budgetExpense: 0, priorRevenue: 0, priorExpense: 0 },
  );
  const budgetNet = summary.budgetRevenue - summary.budgetExpense;
  const priorNet = summary.priorRevenue - summary.priorExpense;

  return (
    <div className="workpaper-panel">
      <WorkpaperHeader title={tab?.label || 'Workpaper'} selectedYear={selectedYear} previousYear={previousYear} />

      <div className="workpaper-summary-grid">
        <BudgetSummary label="Revenue budget" value={formatCurrency(summary.budgetRevenue)} />
        <BudgetSummary label="Expense budget" value={formatCurrency(summary.budgetExpense)} />
        <BudgetSummary label="Net budget" value={formatCurrency(budgetNet)} tone={budgetNet >= 0 ? 'positive' : 'negative'} />
        <BudgetSummary label="Prior year net" value={formatCurrency(priorNet)} />
      </div>

      {lines.length ? (
        <div className="statement-table-frame overflow-auto rounded-[22px] border border-slate-200/70 bg-white/80 dark:border-white/10 dark:bg-white/[0.03]">
          <table className="statement-table min-w-[920px]">
            <thead>
              <tr>
                <th className="text-left">Type</th>
                <th className="text-left">Category</th>
                <th className="text-left">Line</th>
                <th className="text-right">Budget</th>
                <th className="text-right">{previousYear ? `${previousYear} Actual` : 'Prior Year'}</th>
                <th className="text-right">Variance</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.key} className="transition hover:bg-slate-50/80 dark:hover:bg-white/[0.03]">
                  <td className="font-semibold text-slate-700 dark:text-slate-300">
                    <span className={`workpaper-type-pill workpaper-type-${line.type.toLowerCase()}`}>{line.type}</span>
                  </td>
                  <td className="text-slate-600 dark:text-slate-300">{line.category}</td>
                  <td className="text-slate-950 dark:text-white">{line.item}</td>
                  <td className="text-right tabular-nums text-slate-950 dark:text-white">
                    {editable ? (
                      <input
                        type="number"
                        value={line.budget}
                        onChange={(event) => onBudgetChange(line, event.target.value)}
                        className="budget-input"
                      />
                    ) : (
                      formatCurrency(line.budget)
                    )}
                  </td>
                  <td className="text-right tabular-nums text-slate-500 dark:text-slate-400">{formatCurrency(line.prior)}</td>
                  <VarianceCell value={line.budget - line.prior} type={line.type} />
                </tr>
              ))}
              <tr className="bg-slate-50/90 text-base font-semibold dark:bg-white/[0.05]">
                <td colSpan="3" className="text-slate-950 dark:text-white">Net Workpaper Position</td>
                <td className="text-right tabular-nums text-slate-950 dark:text-white">{formatCurrency(budgetNet)}</td>
                <td className="text-right tabular-nums text-slate-500 dark:text-slate-400">{formatCurrency(priorNet)}</td>
                <VarianceCell value={budgetNet - priorNet} type="Revenue" />
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="hub-panel-card p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          No budget lines available for this workpaper.
        </div>
      )}
    </div>
  );
}

function buildBudgetModel(data, selectedYear, previousYear, budgetRows) {
  const priorRows = data.filter((row) => row.Year === previousYear && row.IsActual);
  const selectedActualRows = data.filter((row) => row.Year === selectedYear && row.IsActual);
  const rowsByKey = new Map();

  const ensureLine = (row) => {
    const key = getBudgetLineKey(row);
    const current = rowsByKey.get(key) || {
      key,
      type: row.Type,
      category: row.Category,
      item: row.Item,
      budget: 0,
      prior: 0,
    };

    rowsByKey.set(key, current);
    return current;
  };

  budgetRows.forEach((row) => {
    const line = ensureLine(row);
    line.budget += Number(row.Amount) || 0;
  });

  priorRows.forEach((row) => {
    const line = ensureLine(row);
    line.prior += Number(row.Amount) || 0;
  });

  selectedActualRows.forEach((row) => {
    ensureLine(row);
  });

  const lines = [...rowsByKey.values()].sort((a, b) =>
    [a.type, a.category, a.item].join('|').localeCompare([b.type, b.category, b.item].join('|')),
  );

  const revenueGroups = groupLines(lines.filter((line) => line.type === 'Revenue'));
  const expenseGroups = groupLines(lines.filter((line) => line.type === 'Expense'));
  const metricRows = [
    ...budgetRows,
    ...priorRows.map((row) => ({ ...row, IsActual: false, IsBudget: false, IsPriorYear: true })),
  ];

  return {
    lines,
    revenueGroups,
    expenseGroups,
    metrics: getMetricForRows(metricRows),
  };
}

function getWorkpaperLines(lines, workpaperKey) {
  if (workpaperKey === 'subscriptions') {
    return lines.filter((line) => line.type === 'Revenue' && line.category === 'Subscriptions');
  }

  if (workpaperKey === 'sponsorships') {
    return lines.filter((line) => line.type === 'Revenue' && (line.item.trim() === 'Sponsorships' || line.item.trim() === 'Grants'));
  }

  if (workpaperKey === 'functions') {
    return lines.filter((line) => line.category === FUNCTIONS_CATEGORY && line.item.trim() === SOCIAL_FUNCTIONS_ITEM);
  }

  if (workpaperKey === 'player-payments') {
    return lines.filter((line) => line.type === 'Expense' && line.category === 'Coach, Captain & Player Payments');
  }

  return [];
}

function groupLines(lines) {
  const groups = new Map();
  const hasSubscriptionBuckets = lines.some((line) =>
    line.type === 'Revenue'
    && line.category === SUBSCRIPTIONS_CATEGORY
    && line.item !== LEGACY_SUBSCRIPTIONS_ITEM,
  );

  lines.forEach((line) => {
    const group = groups.get(line.category) || {
      type: line.type,
      category: line.category,
      items: [],
      totals: { budget: 0, prior: 0 },
    };

    const hideLegacySubscriptionLine = hasSubscriptionBuckets
      && line.type === 'Revenue'
      && line.category === SUBSCRIPTIONS_CATEGORY
      && line.item === LEGACY_SUBSCRIPTIONS_ITEM;

    if (!hideLegacySubscriptionLine) {
      group.items.push(line);
    }

    group.totals.budget += line.budget;
    group.totals.prior += line.prior;
    groups.set(line.category, group);
  });

  return [...groups.values()];
}

function createDefaultWorkpapers() {
  return {
    subscriptions: {
      sections: [
        {
          id: 'senior-mens',
          title: 'Senior Mens Subscription Fees',
          rows: [
            { id: 'senior', feeType: 'Senior', price: 490, players: 18 },
            { id: 'concession', feeType: 'Concession', price: 390, players: 12 },
            { id: 'junior-seniors', feeType: 'Junior (Playing Seniors)', price: 150, players: 3 },
          ],
        },
        {
          id: 'juniors',
          title: 'Junior Subscription Fees',
          rows: [
            { id: 'junior', feeType: 'Junior', price: 240, players: 60 },
            { id: 'blast-super-7s', feeType: 'Blast/Super 7s', price: 50, players: 7 },
          ],
        },
        {
          id: 'veterans',
          title: 'Veterans Subscription Fees',
          rows: [{ id: 'vets-payg', feeType: 'Pay as you go', price: 280, players: 11 }],
        },
        {
          id: 'womens',
          title: "Women's Subscription Fees",
          rows: [{ id: 'womens-senior', feeType: 'Senior', price: 100, players: 0 }],
        },
        {
          id: 'all-abilities',
          title: 'All Abilities Subscription Fees',
          rows: [{ id: 'aa-payg', feeType: 'Pay as you go', price: 100, players: 6 }],
        },
      ],
    },
    functions: {
      items: [
        createFunction('reverse-raffle', 'Reverse Raffle', [
          { id: 'rr-ticket-sales', label: 'Ticket Sales', price: 60, quantity: 200 },
          { id: 'rr-other-revenue', label: 'Other', price: 0, quantity: 0 },
        ], [
          { id: 'rr-food', label: 'Food', price: 25, quantity: 125 },
          { id: 'rr-drink', label: 'Drink', price: 10, quantity: 125 },
          { id: 'rr-prize-money', label: 'Prize Money', price: 2000, quantity: 1 },
          { id: 'rr-other-expense', label: 'Other', price: 500, quantity: 1 },
        ]),
        createFunction('ladies-day', 'Ladies Day', [
          { id: 'ld-ticket-sales', label: 'Ticket Sales', price: 20, quantity: 70 },
          { id: 'ld-other-revenue', label: 'Other', price: 0, quantity: 0 },
        ], [
          { id: 'ld-food', label: 'Food', price: 15, quantity: 70 },
          { id: 'ld-drink', label: 'Drink', price: 8, quantity: 70 },
          { id: 'ld-other-expense', label: 'Other', price: 0, quantity: 0 },
        ]),
        createFunction('presentation-night', 'Presentation Night', [
          { id: 'pn-ticket-sales', label: 'Ticket Sales', price: 60, quantity: 60 },
          { id: 'pn-raffle', label: 'Raffle', price: 600, quantity: 1 },
          { id: 'pn-other-revenue', label: 'Other', price: 0, quantity: 0 },
        ], [
          { id: 'pn-venue', label: 'Venue', price: 60, quantity: 60 },
          { id: 'pn-food', label: 'Food', price: 25, quantity: 80 },
          { id: 'pn-other-expense', label: 'Other', price: 0, quantity: 0 },
        ]),
        createFunction('christmas-breakup', 'Christmas Breakup Party'),
        createFunction('trivia-night', 'Trivia Night', [
          { id: 'tn-ticket-sales', label: 'Ticket Sales', price: 25, quantity: 80 },
          { id: 'tn-raffle', label: 'Raffle', price: 500, quantity: 1 },
        ], [
          { id: 'tn-venue', label: 'Venue', price: 0, quantity: 0 },
          { id: 'tn-food', label: 'Food', price: 10, quantity: 80 },
          { id: 'tn-prizes', label: 'Prizes', price: 500, quantity: 1 },
        ]),
        createFunction('other-function', 'Other'),
      ],
    },
    sponsorships: {
      sponsors: [
        { id: 'bowery', name: 'Bowery Capital', amount: 5000 },
        { id: 'acrylico', name: 'Acrylico', amount: 3000 },
        { id: 'mulgrave', name: 'Mulgrave Country Club', amount: 2000 },
        { id: 'weatherware', name: 'Weatherware Protection (Dirk David)', amount: 0 },
        { id: 'albys', name: "Alby's Lawnmowing Service", amount: 500 },
        { id: 'bulk-transport', name: 'Bulk Transport Australia (Tye Marchetti)', amount: 0 },
        { id: 'bendigo', name: 'Bendigo Bank', amount: 0 },
        { id: 'simongrady', name: 'Simon Grady', amount: 1000 },
        { id: 'mick-legrand', name: 'Mick LeGrand', amount: 0 },
        { id: 'matt-morley', name: 'Matt Morley', amount: 0 },
        { id: 'simon-cuce', name: 'Simon Cuce', amount: 0 },
        { id: 'mcdonalds', name: 'McDonalds', amount: 0 },
        { id: 'radiology', name: 'Radiology Victoria', amount: 0 },
        { id: 'sponsor-other', name: 'Other', amount: 0 },
      ],
      grants: [
        { id: 'council', name: 'Council', amount: 0 },
        { id: 'moca', name: 'MOCA', amount: 4000 },
        { id: 'maaca', name: 'Other (MAACA)', amount: 0 },
      ],
    },
    playerPayments: {
      rows: [
        { id: 'coach', name: 'Coach', budgetItem: 'Senior Coach', amount: 6000 },
        { id: 'captain', name: 'Captain', budgetItem: 'Captain ', amount: 1000 },
        { id: 'player-other', name: 'Other', budgetItem: 'Player Payments', amount: 6000 },
        { id: 'accommodation', name: 'Accommodation for 1x Players', amount: 3000 },
        { id: 'flights', name: 'Flights', amount: 3000 },
        { id: 'administration', name: 'Administration', amount: 567 },
        { id: 'other-payment', name: 'Other', amount: 0 },
        { id: 'travel-allowance', name: 'Travel Allowance', amount: 500 },
      ],
    },
  };
}

function createFunction(id, name, revenueLines = [{ id: `${id}-revenue`, label: 'Ticket Sales', price: 0, quantity: 0 }], expenseLines = [{ id: `${id}-expense`, label: 'Other', price: 0, quantity: 0 }]) {
  return { id, name, revenueLines, expenseLines };
}

function syncAllWorkpaperBudgets(values, workpapers) {
  return ['subscriptions', 'functions', 'sponsorships', 'player-payments'].reduce(
    (current, key) => syncWorkpaperBudget(current, key, workpapers),
    values,
  );
}

function syncWorkpaperBudget(values, workpaperKey, workpapers) {
  const next = { ...values };

  if (workpaperKey === 'subscriptions') {
    removeBudgetLine(next, 'Revenue', SUBSCRIPTIONS_CATEGORY, LEGACY_SUBSCRIPTIONS_ITEM);
    workpapers.subscriptions.sections.forEach((section) => {
      setBudgetLine(
        next,
        'Revenue',
        SUBSCRIPTIONS_CATEGORY,
        getSubscriptionBudgetItem(section),
        calculateSubscriptionSectionTotal(section),
      );
    });
  }

  if (workpaperKey === 'functions') {
    const totals = calculateFunctionsTotals(workpapers.functions);
    removeBudgetLine(next, 'Revenue', FUNCTIONS_CATEGORY, LEGACY_FUNCTIONS_ITEM);
    removeBudgetLine(next, 'Expense', FUNCTIONS_CATEGORY, LEGACY_FUNCTIONS_ITEM);
    setBudgetLine(next, 'Revenue', FUNCTIONS_CATEGORY, SOCIAL_FUNCTIONS_ITEM, totals.revenue);
    setBudgetLine(next, 'Expense', FUNCTIONS_CATEGORY, SOCIAL_FUNCTIONS_ITEM, totals.expense);
  }

  if (workpaperKey === 'sponsorships') {
    const sponsorTotal = workpapers.sponsorships.sponsors.reduce((sum, row) => sum + toNumber(row.amount), 0);
    const grantTotal = workpapers.sponsorships.grants.reduce((sum, row) => sum + toNumber(row.amount), 0);
    setBudgetLine(next, 'Revenue', 'Sponsors, Grants & Memberships', 'Sponsorships', sponsorTotal);
    setBudgetLine(next, 'Revenue', 'Sponsors, Grants & Memberships', 'Grants', grantTotal);
  }

  if (workpaperKey === 'player-payments') {
    Object.entries(next).forEach(([key, value]) => {
      if (value?.type === 'Expense' && value?.category === 'Coach, Captain & Player Payments') {
        delete next[key];
      }
    });

    workpapers.playerPayments.rows.forEach((row) => {
      setBudgetLine(next, 'Expense', 'Coach, Captain & Player Payments', row.budgetItem || row.name, row.amount);
    });
  }

  return next;
}

function setBudgetLine(values, type, category, item, amount) {
  const key = getBudgetLineKey({ Type: type, Category: category, Item: item });
  values[key] = { type, category, item, amount: toNumber(amount) };
}

function removeBudgetLine(values, type, category, item) {
  Object.entries(values).forEach(([key, value]) => {
    const keyParts = key.split('|||');
    const valueType = String(value?.type || value?.Type || keyParts[0] || '').trim();
    const valueCategory = String(value?.category || value?.Category || keyParts[1] || '').trim();
    const valueItem = String(value?.item || value?.Item || keyParts[2] || '').trim();

    if (valueType === type && valueCategory === category && valueItem === item) {
      delete values[key];
    }
  });
}

function calculateSubscriptionsTotal(subscriptions) {
  return subscriptions.sections.reduce(
    (sum, section) => sum + calculateSubscriptionSectionTotal(section),
    0,
  );
}

function calculateSubscriptionSectionTotal(section) {
  return section.rows.reduce((sum, row) => sum + lineTotal(row), 0);
}

function getSubscriptionBudgetItem(section) {
  return section.budgetItem || section.title;
}

function calculateFunctionsTotals(functions) {
  return functions.items.reduce(
    (acc, item) => {
      acc.revenue += calculateFunctionLineTotal(item.revenueLines);
      acc.expense += calculateFunctionLineTotal(item.expenseLines);
      acc.net = acc.revenue - acc.expense;
      return acc;
    },
    { revenue: 0, expense: 0, net: 0 },
  );
}

function calculateFunctionLineTotal(lines) {
  return lines.reduce((sum, line) => sum + lineTotal(line, 'quantity'), 0);
}

function lineTotal(row, quantityKey = 'players') {
  return toNumber(row.price) * toNumber(row[quantityKey]);
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

function toNumber(value) {
  return Number(value) || 0;
}

function TextInput({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="workpaper-edit-input workpaper-text-input"
    />
  );
}

function MoneyInput({ disabled, value, onChange }) {
  if (disabled) return <span className="tabular-nums font-semibold">{formatCurrency(value)}</span>;

  return (
    <input
      type="number"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="workpaper-edit-input workpaper-number-input"
    />
  );
}

function NumberInput({ disabled, value, onChange }) {
  if (disabled) return <span className="tabular-nums font-semibold">{value}</span>;

  return (
    <input
      type="number"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="workpaper-edit-input workpaper-count-input"
    />
  );
}

function ActionButton({ icon: Icon, label, onClick, small = false }) {
  return (
    <button type="button" onClick={onClick} className={`workpaper-action-button ${small ? 'workpaper-action-button-small' : ''}`}>
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function IconButton({ icon: Icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="workpaper-icon-button" title={label} aria-label={label}>
      <Icon className="h-4 w-4" />
    </button>
  );
}

function GrandTotal({ compact = false, label, secondary, value }) {
  return (
    <div className={`workpaper-grand-total ${compact ? 'workpaper-grand-total-compact' : ''}`}>
      <span>{label}</span>
      {secondary ? <em>{secondary}</em> : null}
      <strong>{formatCurrency(value)}</strong>
    </div>
  );
}

function BudgetSummary({ label, value, tone }) {
  return (
    <div className="budget-summary-card">
      <span>{label}</span>
      <strong className={tone ? `budget-summary-${tone}` : undefined}>{value}</strong>
    </div>
  );
}

function GroupTitle({ title }) {
  return (
    <tr className="detail-section-row">
      <td colSpan="4">
        {title}
      </td>
    </tr>
  );
}

function CategoryGroup({ group, editable, onBudgetChange }) {
  return (
    <>
      <tr className="detail-category-row">
        <td colSpan="4">
          {group.category}
        </td>
      </tr>
      {group.items.map((item) => (
        <tr key={item.key} className="transition hover:bg-slate-50/80 dark:hover:bg-white/[0.03]">
          <td className="pl-8 text-slate-600 dark:text-slate-300">{item.item}</td>
          <td className="text-right tabular-nums text-slate-950 dark:text-white">
            {editable ? (
              <input
                type="number"
                value={item.budget}
                onChange={(event) => onBudgetChange(item, event.target.value)}
                className="budget-input"
              />
            ) : (
              formatCurrency(item.budget)
            )}
          </td>
          <td className="text-right tabular-nums text-slate-500 dark:text-slate-400">{formatCurrency(item.prior)}</td>
          <VarianceCell value={item.budget - item.prior} type={group.type} />
        </tr>
      ))}
      <tr className="detail-total-row">
        <td className="text-slate-950 dark:text-white">Total {group.category}</td>
        <td className="text-right tabular-nums text-slate-950 dark:text-white">{formatCurrency(group.totals.budget)}</td>
        <td className="text-right tabular-nums text-slate-500 dark:text-slate-400">{formatCurrency(group.totals.prior)}</td>
        <VarianceCell value={group.totals.budget - group.totals.prior} type={group.type} />
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

export default BudgetPage;
