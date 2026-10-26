// WBS 1.3 core-module status table. Rows are editable and deliberately NOT
// aggregated into overall progress (no documented aggregation rule exists).
import { escapeHtml } from '../utils/format.js';

const FLAGS = [
  ['none', 'On track / not flagged'],
  ['at-risk', 'At risk'],
  ['blocked', 'Blocked'],
];

function input(module, field, type, label, extra = '') {
  const value = module[field] ?? '';
  return `<input type="${type}" data-id="${escapeHtml(module.id)}" data-field="${field}" value="${escapeHtml(value)}" aria-label="${escapeHtml(module.id)} ${label}" ${extra}>`;
}

// Re-rendered only on load/reset/import/demo (never while typing, to keep focus).
export function renderWbsTable(root, modules) {
  const rows = modules
    .map((m) => {
      const flagOptions = FLAGS.map(
        ([value, text]) => `<option value="${value}"${m.flag === value ? ' selected' : ''}>${text}</option>`,
      ).join('');
      return `<tr class="${m.flag !== 'none' ? `row--${m.flag}` : ''}" data-row="${escapeHtml(m.id)}">
        <th scope="row"><strong>${escapeHtml(m.id)}</strong> ${escapeHtml(m.name)}</th>
        <td>${input(m, 'owner', 'text', 'owner', 'placeholder="Owner"')}</td>
        <td>${input(m, 'plannedDate', 'date', 'planned date')}</td>
        <td>${input(m, 'actualDate', 'date', 'actual date')}</td>
        <td>${input(m, 'evidenceRef', 'text', 'evidence link or reference', 'placeholder="Link / ref"')}</td>
        <td>${input(m, 'completion', 'number', 'completion percent', 'min="0" max="100" step="any" placeholder="—"')}
            <span class="field-error" data-error-for="${escapeHtml(m.id)}" role="alert"></span></td>
        <td><select data-id="${escapeHtml(m.id)}" data-field="flag" aria-label="${escapeHtml(m.id)} status flag">${flagOptions}</select></td>
      </tr>`;
    })
    .join('');

  root.innerHTML = `<table class="table table--wbs">
    <thead><tr><th scope="col">Work package</th><th scope="col">Owner</th><th scope="col">Planned date</th>
      <th scope="col">Actual date</th><th scope="col">Evidence</th><th scope="col">Completion %</th><th scope="col">Flag</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <p class="chart-note">Module completion is recorded for follow-up only; it is not summed into overall progress.</p>`;
}

// onChange(id, field, value) with numbers parsed ('' becomes null).
export function bindWbsTable(root, onChange) {
  const handler = (event) => {
    const el = event.target;
    if (!el.dataset || !el.dataset.field) return;
    let value = el.value;
    if (el.dataset.field === 'completion') {
      value = value === '' || !Number.isFinite(Number(value)) ? null : Number(value);
    }
    onChange(el.dataset.id, el.dataset.field, value);
  };
  root.addEventListener('input', handler);
  root.addEventListener('change', handler);
}

export function showModuleErrors(root, errors) {
  root.querySelectorAll('[data-error-for]').forEach((el) => {
    const message = errors[`module:${el.dataset.errorFor}:completion`] || '';
    el.textContent = message;
    const field = root.querySelector(`input[data-id="${el.dataset.errorFor}"][data-field="completion"]`);
    if (field) field.setAttribute('aria-invalid', message ? 'true' : 'false');
  });
}
