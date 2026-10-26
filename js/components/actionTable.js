// Corrective / preventive action preview. Due dates and evidence are editable;
// the proposed due dates are relative and provisional.
import { escapeHtml } from '../utils/format.js';

export function renderActionTable(root, actions) {
  const rows = actions
    .map(
      (a) => `<tr>
        <th scope="row"><strong>${escapeHtml(a.id)}</strong> ${escapeHtml(a.title)}</th>
        <td>${escapeHtml(a.owner)}</td>
        <td><input type="text" data-id="${escapeHtml(a.id)}" data-field="due" value="${escapeHtml(a.due)}" aria-label="${escapeHtml(a.id)} due date"></td>
        <td>${escapeHtml(a.measure)}</td>
        <td><input type="text" data-id="${escapeHtml(a.id)}" data-field="evidenceRef" value="${escapeHtml(a.evidenceRef)}" placeholder="Link / ref" aria-label="${escapeHtml(a.id)} evidence"></td>
      </tr>`,
    )
    .join('');

  root.innerHTML = `<table class="table table--actions">
    <thead><tr><th scope="col">Action</th><th scope="col">Owner</th><th scope="col">Due (provisional)</th>
      <th scope="col">Success measure</th><th scope="col">Evidence</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <p class="chart-note">Proposed actions, not claims that a variance has occurred. Edit due dates once the team agrees them.</p>`;
}

export function bindActionTable(root, onChange) {
  root.addEventListener('input', (event) => {
    const el = event.target;
    if (el.dataset && el.dataset.field) onChange(el.dataset.id, el.dataset.field, el.value);
  });
}
