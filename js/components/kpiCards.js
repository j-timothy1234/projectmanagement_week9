// KPI cards. A card is only coloured good/bad when the user has marked the data
// verified; missing inputs always show N/A with a "Missing evidence" tag.
import { count, evidenceTone, isNum, pct, pp, signedUgx } from '../utils/format.js';

function cardModel(state, metrics) {
  const provisional = state.baselineApproved ? '' : ' (vs provisional baseline)';
  const note = (value, missing, text) => (isNum(value) ? text : missing);

  return [
    {
      label: 'Schedule gap',
      area: 'Schedule',
      value: pp(metrics.scheduleGap),
      raw: metrics.scheduleGap,
      favourable: isNum(metrics.scheduleGap) ? metrics.scheduleGap >= 0 : null,
      note: note(
        metrics.scheduleGap,
        'Enter planned and actual weighted completion',
        (metrics.scheduleGap < 0 ? 'Behind planned completion' : 'At or ahead of planned completion') + provisional,
      ),
    },
    {
      label: 'Simple spending variance',
      area: 'Cost',
      value: signedUgx(metrics.spendVariance),
      raw: metrics.spendVariance,
      favourable: isNum(metrics.spendVariance) ? metrics.spendVariance >= 0 : null,
      note: note(
        metrics.spendVariance,
        'Enter planned and actual spending to date',
        (metrics.spendVariance < 0 ? 'Spending above planned-to-date' : 'Spending at or below planned-to-date') + provisional,
      ),
    },
    {
      label: 'Due WBS acceptance',
      area: 'Scope',
      value: pct(metrics.acceptance),
      raw: metrics.acceptance,
      favourable: null,
      note: note(metrics.acceptance, 'Enter deliverables due and accepted', 'Accepted deliverables ÷ deliverables due'),
    },
    {
      label: 'Test pass rate',
      area: 'Quality',
      value: pct(metrics.passRate),
      raw: metrics.passRate,
      favourable: null,
      note: note(metrics.passRate, 'Enter tests run and tests passed', 'Passed tests ÷ tests run'),
    },
    {
      label: 'Unresolved high risks / issues',
      area: 'Risk',
      value: count(metrics.highRisks),
      raw: metrics.highRisks,
      favourable: isNum(metrics.highRisks) ? metrics.highRisks === 0 : null,
      note: note(metrics.highRisks, 'Needs the current risk/issue register', 'Open items rated high priority'),
    },
    {
      label: 'Open critical defects',
      area: 'Quality',
      value: count(metrics.criticalDefects),
      raw: metrics.criticalDefects,
      favourable: isNum(metrics.criticalDefects) ? metrics.criticalDefects === 0 : null,
      note: note(metrics.criticalDefects, 'Needs the QA defect log', 'Unresolved defects rated critical'),
    },
  ];
}

export function renderKpiCards(root, state, metrics) {
  root.innerHTML = cardModel(state, metrics)
    .map((card) => {
      const tone = evidenceTone(state, card.raw);
      // Good/bad colouring is reserved for user-verified data.
      let cls = tone.cls;
      if (cls === 'verified') cls = card.favourable === null ? 'verified' : card.favourable ? 'good' : 'bad';
      return `<article class="kpi kpi--${cls}">
        <h3 class="kpi__label">${card.label} <span class="kpi__area">${card.area}</span></h3>
        <p class="kpi__value">${card.value}</p>
        <p class="kpi__note">${card.note}</p>
        <span class="tag tag--${tone.cls}">${tone.tag}</span>
      </article>`;
    })
    .join('');
}
