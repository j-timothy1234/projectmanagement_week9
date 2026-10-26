// Application entry point: owns the state, wires events and triggers renders.
import { emptyState } from './data/projectPlan.js';
import { demoState } from './data/demoData.js';
import { clear, exportJson, importJson, load, save } from './services/storage.js';
import { validate } from './services/validation.js';
import { calculate } from './utils/metrics.js';
import { formatDate } from './utils/format.js';
import { renderKpiCards } from './components/kpiCards.js';
import { renderBudgetChart, renderGantt, renderProgressChart, renderSpendChart } from './components/charts.js';
import { bindWbsTable, renderWbsTable, showModuleErrors } from './components/wbsTable.js';
import { bindActionTable, renderActionTable } from './components/actionTable.js';
import { readForm, renderForm, showErrors, writeForm } from './components/dataForm.js';
import { renderCalculations, renderEvmPanel, renderInterpretation, renderVariancePanels } from './components/analysis.js';

const $ = (id) => document.getElementById(id);
let state = load();
let toastTimer;

const BANNERS = {
  unverified: ['DATA NOT VERIFIED', 'No verified Group B actuals have been entered. KPIs show N/A until figures are supplied.'],
  demo: ['ILLUSTRATIVE EXAMPLE', 'Hypothetical teaching numbers — these are NOT Group B results. Use Reset to clear them.'],
  verified: ['MARKED VERIFIED BY USER', 'Keep the source records (receipts, Trello, GitHub, QA logs) ready to show the lecturer.'],
};

function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 5000);
}

function persist() {
  if (!save(state)) toast('Could not save to this browser (storage blocked). Use Export JSON to keep your data.');
}

// Recompute everything that depends on state. Editable tables/forms are not re-rendered.
function update() {
  const { clean, errors } = validate(state);
  const metrics = calculate(clean);

  showErrors($('data-form'), errors);
  showModuleErrors($('wbs-table'), errors);

  renderKpiCards($('kpi-cards'), clean, metrics);
  renderProgressChart($('chart-progress'), clean);
  renderSpendChart($('chart-spend'), clean);
  renderGantt($('gantt'), clean);
  renderCalculations($('calc-table'), clean, metrics);
  renderInterpretation($('interpretation'), clean, metrics);
  renderVariancePanels({ schedule: $('variance-schedule'), cost: $('variance-cost') }, clean, metrics);
  renderEvmPanel($('evm-panel'), clean, metrics);

  const [title, detail] = BANNERS[state.evidence];
  $('banner').className = `banner banner--${state.evidence}`;
  $('banner-title').textContent = title;
  $('banner-detail').textContent = detail;
  $('report-date').textContent = `Report date: ${formatDate(state.statusDate)}`;
  $('baseline-badge').textContent = state.baselineApproved
    ? 'Baseline approval recorded by user'
    : 'Provisional baseline: 16-week WBS';
  $('budget-badge').textContent = state.baselineApproved
    ? 'Budget approval recorded by user'
    : 'Provisional budget: UGX 20,000,000';
}

// Re-render the editable parts too (after load, reset, import or demo).
function renderAll() {
  writeForm($('data-form'), state);
  renderWbsTable($('wbs-table'), state.modules);
  renderActionTable($('action-table'), state.actions);
  update();
}

function hasEntries() {
  return JSON.stringify(state) !== JSON.stringify(emptyState());
}

function showView(name) {
  for (const view of ['dashboard', 'analysis']) $(`view-${view}`).hidden = view !== name;
  document.querySelectorAll('[data-view]').forEach((button) => {
    if (button.dataset.view === name) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
}

function updateRow(list, id, field, value) {
  state = { ...state, [list]: state[list].map((row) => (row.id === id ? { ...row, [field]: value } : row)) };
  persist();
  update();
}

// ---- Event wiring (no inline handlers) ----
$('data-form').addEventListener('input', (event) => {
  const form = $('data-form');
  const wasDemo = state.evidence === 'demo';
  state = { ...state, ...readForm(form) };
  // Hand-editing the example means the numbers are no longer the example: drop the
  // demo label and the pre-set EVM "verified" flags so nothing is mistaken for evidence.
  if (wasDemo && event.target.name !== 'evidence') {
    state = { ...state, evidence: 'unverified', evmVerified: false, evmWeightsDocumented: false };
    form.elements.evidence.value = 'unverified';
    form.elements.evmVerified.checked = false;
    form.elements.evmWeightsDocumented.checked = false;
  }
  persist();
  update();
});

$('data-form').addEventListener('submit', (event) => event.preventDefault());
bindWbsTable($('wbs-table'), (id, field, value) => updateRow('modules', id, field, value));
bindActionTable($('action-table'), (id, field, value) => updateRow('actions', id, field, value));

document.querySelectorAll('[data-view]').forEach((button) => {
  button.addEventListener('click', () => showView(button.dataset.view));
});

$('btn-demo').addEventListener('click', () => {
  if (hasEntries() && !window.confirm('Replace the current entries with the HYPOTHETICAL example? These are not Group B results.')) return;
  state = demoState();
  persist();
  renderAll();
  toast('Hypothetical example loaded — not Group B results.');
});

$('btn-reset').addEventListener('click', () => {
  if (hasEntries() && !window.confirm('Reset all dashboard data? This clears the saved copy in this browser.')) return;
  state = emptyState();
  clear();
  renderAll();
  toast('Dashboard reset. Data not verified.');
});

$('btn-export').addEventListener('click', () => exportJson(state));
$('btn-import').addEventListener('click', () => $('import-file').click());
$('import-file').addEventListener('change', async (event) => {
  const [file] = event.target.files;
  event.target.value = '';
  if (!file) return;
  try {
    state = await importJson(file);
    persist();
    renderAll();
    toast(`Imported ${file.name}.`);
  } catch (error) {
    toast(`Import failed: ${error.message}`);
  }
});

$('btn-print').addEventListener('click', () => {
  showView('dashboard');
  window.print();
});

// ---- Initial render ----
renderForm($('data-form'));
renderBudgetChart($('chart-budget'));
renderAll();
showView('dashboard');
