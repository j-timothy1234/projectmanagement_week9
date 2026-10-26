// Data-entry form for verified figures. Built once from FIELD_GROUPS; reading,
// writing and error display are separate functions so typing never re-renders it.
import { escapeHtml } from '../utils/format.js';

const EVIDENCE_OPTIONS = [
  ['unverified', 'Not verified (default)'],
  ['verified', 'Verified by Group B (evidence retained)'],
  ['demo', 'Illustrative example (set by the demo button)'],
];

export const FIELD_GROUPS = [
  {
    title: 'Reporting',
    fields: [
      { key: 'statusDate', label: 'Status date', type: 'date' },
      { key: 'reportingWeek', label: 'Reporting week (1–16)', type: 'number', min: 1, max: 16, step: 1 },
      { key: 'evidence', label: 'Evidence status of the figures below', type: 'select', options: EVIDENCE_OPTIONS },
      { key: 'baselineApproved', label: 'Schedule and budget baseline formally approved', type: 'checkbox' },
    ],
  },
  {
    title: 'Schedule',
    fields: [
      { key: 'plannedProgress', label: 'Planned weighted completion (%)', type: 'number', min: 0, max: 100, step: 'any', hint: 'From the approved plan' },
      { key: 'actualProgress', label: 'Actual accepted weighted completion (%)', type: 'number', min: 0, max: 100, step: 'any', hint: 'Accepted work only; use a documented weighting' },
    ],
  },
  {
    title: 'Cost',
    fields: [
      { key: 'plannedSpend', label: 'Planned spending to date (UGX)', type: 'number', min: 0, step: 'any' },
      { key: 'actualSpend', label: 'Actual spending to date (UGX)', type: 'number', min: 0, step: 'any', hint: 'Backed by receipts or ledger' },
    ],
  },
  {
    title: 'Scope, quality and risk',
    fields: [
      { key: 'dueDeliverables', label: 'Deliverables due', type: 'number', min: 0, step: 1 },
      { key: 'acceptedDeliverables', label: 'Deliverables accepted', type: 'number', min: 0, step: 1 },
      { key: 'testsRun', label: 'Tests run', type: 'number', min: 0, step: 1 },
      { key: 'testsPassed', label: 'Tests passed', type: 'number', min: 0, step: 1 },
      { key: 'criticalDefects', label: 'Open critical defects', type: 'number', min: 0, step: 1 },
      { key: 'highRisks', label: 'Unresolved high risks / issues', type: 'number', min: 0, step: 1 },
    ],
  },
  {
    title: 'Optional EVM inputs',
    note: 'Supply PV, EV and AC separately. EV must come from documented budget weights, not a raw task-count percentage. The UGX 20m total (with contingency) is not automatically a valid BAC.',
    fields: [
      { key: 'evmBac', label: 'BAC, if separately approved (UGX)', type: 'number', min: 0, step: 'any' },
      { key: 'evmPv', label: 'Planned Value, PV (UGX)', type: 'number', min: 0, step: 'any' },
      { key: 'evmEv', label: 'Earned Value, EV (UGX)', type: 'number', min: 0, step: 'any' },
      { key: 'evmAc', label: 'Actual Cost, AC (UGX)', type: 'number', min: 0, step: 'any' },
      { key: 'evmWeightsDocumented', label: 'Budget weights behind EV are documented', type: 'checkbox' },
      { key: 'evmVerified', label: 'PV, EV and AC are verified', type: 'checkbox' },
    ],
  },
];

const ALL_FIELDS = FIELD_GROUPS.flatMap((group) => group.fields);

function fieldHtml(f) {
  const id = `f-${f.key}`;
  const describedBy = `err-${f.key}${f.hint ? ` hint-${f.key}` : ''}`;
  const hint = f.hint ? `<small id="hint-${f.key}" class="field__hint">${escapeHtml(f.hint)}</small>` : '';
  const error = `<span class="field-error" id="err-${f.key}" role="alert"></span>`;

  if (f.type === 'checkbox') {
    return `<div class="field field--check"><label><input type="checkbox" id="${id}" name="${f.key}" aria-describedby="${describedBy}"> ${escapeHtml(f.label)}</label>${hint}${error}</div>`;
  }
  if (f.type === 'select') {
    const options = f.options.map(([value, text]) => `<option value="${value}">${escapeHtml(text)}</option>`).join('');
    return `<div class="field"><label for="${id}">${escapeHtml(f.label)}</label><select id="${id}" name="${f.key}" aria-describedby="${describedBy}">${options}</select>${hint}${error}</div>`;
  }
  const attrs = ['min', 'max', 'step'].filter((a) => f[a] !== undefined).map((a) => `${a}="${f[a]}"`).join(' ');
  return `<div class="field"><label for="${id}">${escapeHtml(f.label)}</label><input type="${f.type}" id="${id}" name="${f.key}" ${attrs} inputmode="${f.type === 'number' ? 'decimal' : 'text'}" aria-describedby="${describedBy}">${hint}${error}</div>`;
}

export function renderForm(root) {
  root.innerHTML = FIELD_GROUPS.map(
    (group) => `<fieldset class="form-group"><legend>${group.title}</legend>
      ${group.note ? `<p class="form-group__note">${escapeHtml(group.note)}</p>` : ''}
      <div class="form-grid">${group.fields.map(fieldHtml).join('')}</div></fieldset>`,
  ).join('');
}

const control = (root, key) => root.querySelector(`[name="${key}"]`);

export function writeForm(root, state) {
  for (const f of ALL_FIELDS) {
    const el = control(root, f.key);
    if (f.type === 'checkbox') el.checked = Boolean(state[f.key]);
    else el.value = state[f.key] ?? '';
  }
}

// Returns only the form's own keys; blank number fields become null (missing).
export function readForm(root) {
  const values = {};
  for (const f of ALL_FIELDS) {
    const el = control(root, f.key);
    if (f.type === 'checkbox') values[f.key] = el.checked;
    else if (f.type === 'number') values[f.key] = el.value === '' || !Number.isFinite(Number(el.value)) ? null : Number(el.value);
    else values[f.key] = el.value;
  }
  return values;
}

export function showErrors(root, errors) {
  for (const f of ALL_FIELDS) {
    const message = errors[f.key] || '';
    root.querySelector(`#err-${f.key}`).textContent = message;
    control(root, f.key).setAttribute('aria-invalid', message ? 'true' : 'false');
  }
}
