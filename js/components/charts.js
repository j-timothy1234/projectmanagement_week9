// CSS-based charts: progress bars, spending bars, budget distribution and a
// Gantt-like WBS timeline. No chart library; every chart has a text equivalent.
import { BUDGET_LINES, BUDGET_TOTAL, PHASES, TOTAL_WEEKS } from '../data/projectPlan.js';
import { escapeHtml, evidenceTone, fmtNumber, isNum, pct, ugx } from '../utils/format.js';

function barRow({ label, value, max, text, cls }) {
  const width = isNum(value) && max > 0 ? Math.min(100, Math.max(0, (100 * value) / max)) : 0;
  const missing = !isNum(value);
  return `<div class="bar-row">
    <span class="bar-row__label">${escapeHtml(label)}</span>
    <div class="bar-track${missing ? ' bar-track--missing' : ''}">
      <div class="bar-fill bar-fill--${cls}" style="width:${width}%"></div>
    </div>
    <span class="bar-row__value">${missing ? '—' : text}</span>
  </div>`;
}

export function renderProgressChart(root, state) {
  const actualTone = evidenceTone(state, state.actualProgress);
  root.innerHTML =
    barRow({ label: 'Planned', value: state.plannedProgress, max: 100, text: pct(state.plannedProgress), cls: 'provisional' }) +
    barRow({ label: 'Actual', value: state.actualProgress, max: 100, text: pct(state.actualProgress), cls: actualTone.cls }) +
    `<p class="chart-note">Weighted completion. Actual is shown only once entered (${escapeHtml(actualTone.tag.toLowerCase())}).</p>`;
}

export function renderSpendChart(root, state) {
  const actualTone = evidenceTone(state, state.actualSpend);
  const share = (value) => (isNum(value) ? `${ugx(value)} · ${pct((100 * value) / BUDGET_TOTAL)} of budget` : '—');
  root.innerHTML =
    barRow({ label: 'Planned to date', value: state.plannedSpend, max: BUDGET_TOTAL, text: share(state.plannedSpend), cls: 'provisional' }) +
    barRow({ label: 'Actual to date', value: state.actualSpend, max: BUDGET_TOTAL, text: share(state.actualSpend), cls: actualTone.cls }) +
    `<p class="chart-note">Scale: provisional total budget ${ugx(BUDGET_TOTAL)}.</p>`;
}

export function renderBudgetChart(root) {
  const max = Math.max(...BUDGET_LINES.map((line) => line.amount));
  root.innerHTML =
    BUDGET_LINES.map((line) =>
      barRow({
        label: `${line.id} ${line.name}`,
        value: line.amount,
        max,
        text: `${fmtNumber(line.amount)} · ${pct((100 * line.amount) / BUDGET_TOTAL)}`,
        cls: line.id === 'CR' ? 'contingency' : 'provisional',
      }),
    ).join('') +
    `<p class="chart-note">Total ${ugx(BUDGET_TOTAL)} (provisional, pending approval). Includes shared costs and contingency.</p>`;
}

// Timeline shows the provisional PLAN only, never actual progress.
export function renderGantt(root, state) {
  const week = state.reportingWeek;
  const weeks = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);

  const header =
    '<div class="gantt__corner" style="grid-row:1;grid-column:1">WBS phase</div>' +
    weeks
      .map((w) => `<div class="gantt__week${w === week ? ' gantt__week--now' : ''}" style="grid-row:1;grid-column:${w + 1}">${w}</div>`)
      .join('');

  const rows = PHASES.map((phase, index) => {
    const row = index + 2;
    const cells = weeks
      .map((w) => `<div class="gantt__cell${w === week ? ' gantt__cell--now' : ''}" style="grid-row:${row};grid-column:${w + 1}"></div>`)
      .join('');
    const active = isNum(week) && week >= phase.start && week <= phase.end;
    return (
      `<div class="gantt__label" style="grid-row:${row};grid-column:1"><strong>${phase.id}</strong> ${escapeHtml(phase.name)}</div>` +
      cells +
      `<div class="gantt__bar${active ? ' gantt__bar--active' : ''}" style="grid-row:${row};grid-column:${phase.start + 1} / ${phase.end + 2}" title="${escapeHtml(phase.name)}: Weeks ${phase.start}–${phase.end}">W${phase.start}${phase.end > phase.start ? `–${phase.end}` : ''}</div>`
    );
  }).join('');

  root.innerHTML =
    `<div class="gantt" role="img" aria-label="Provisional 16-week plan. ${PHASES.map((p) => `${p.id} ${p.name}: weeks ${p.start} to ${p.end}`).join('; ')}. ${isNum(week) ? `Current reporting week: ${week}.` : ''}">${header}${rows}</div>` +
    '<p class="chart-note">Provisional plan only (16-week WBS); bars do not show achieved progress.</p>';
}
