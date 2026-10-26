// Performance Analysis tab: live calculation table, interpretation, the two
// variance-investigation panels and the optional EVM panel.
import { evidenceTone, isNum, pct, pp, ratio, signedUgx, ugx } from '../utils/format.js';

const li = (items) => `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;

function banner(state) {
  if (state.evidence === 'demo') return '<p class="inline-flag inline-flag--illustrative">ILLUSTRATIVE EXAMPLE — not Group B results.</p>';
  if (state.evidence !== 'verified') return '<p class="inline-flag inline-flag--unverified">DATA NOT VERIFIED — interpret as entered, not as evidence.</p>';
  return '<p class="inline-flag inline-flag--verified">Marked verified by the user — keep source records for the lecturer.</p>';
}

export function renderCalculations(root, state, m) {
  const rows = [
    ['Schedule gap', 'Actual % − Planned %', `${state.actualProgress ?? '—'} − ${state.plannedProgress ?? '—'}`, pp(m.scheduleGap), m.scheduleGap],
    ['Simple spending variance', 'Planned spend − Actual spend', `${isNum(state.plannedSpend) ? state.plannedSpend.toLocaleString('en-US') : '—'} − ${isNum(state.actualSpend) ? state.actualSpend.toLocaleString('en-US') : '—'}`, signedUgx(m.spendVariance), m.spendVariance],
    ['Due WBS acceptance', 'Accepted ÷ Due × 100', `${state.acceptedDeliverables ?? '—'} ÷ ${state.dueDeliverables ?? '—'}`, pct(m.acceptance), m.acceptance],
    ['Test pass rate', 'Passed ÷ Run × 100', `${state.testsPassed ?? '—'} ÷ ${state.testsRun ?? '—'}`, pct(m.passRate), m.passRate],
  ];
  root.innerHTML = `<table class="table"><thead><tr><th scope="col">Indicator</th><th scope="col">Formula</th>
    <th scope="col">Inputs</th><th scope="col">Result</th><th scope="col">Evidence</th></tr></thead><tbody>${rows
      .map(([name, formula, inputs, result, raw]) => {
        const tone = evidenceTone(state, raw);
        return `<tr><th scope="row">${name}</th><td>${formula}</td><td>${inputs}</td><td><strong>${result}</strong></td><td><span class="tag tag--${tone.cls}">${tone.tag}</span></td></tr>`;
      })
      .join('')}</tbody></table>`;
}

export function renderInterpretation(root, state, m) {
  const lines = [];
  lines.push(
    isNum(m.scheduleGap)
      ? `<strong>Schedule:</strong> actual weighted completion is ${pct(state.actualProgress)} against ${pct(state.plannedProgress)} planned, a gap of ${pp(m.scheduleGap)}. ${m.scheduleGap < 0 ? 'This is progress behind the plan, not a delay measured in days or weeks.' : 'No adverse gap in the entered figures.'}`
      : '<strong>Schedule:</strong> cannot be assessed — planned and/or actual weighted completion is missing.',
  );
  lines.push(
    isNum(m.spendVariance)
      ? `<strong>Cost:</strong> spending to date is ${ugx(state.actualSpend)} against ${ugx(state.plannedSpend)} planned; simple variance ${signedUgx(m.spendVariance)}. ${m.spendVariance < 0 ? 'Spending is above the planned-to-date amount; this alone does not show the total budget will be exceeded.' : 'Spending is not above the planned-to-date amount.'}`
      : '<strong>Cost:</strong> cannot be assessed — planned and/or actual spending to date is missing.',
  );
  lines.push(
    isNum(m.acceptance)
      ? `<strong>Scope:</strong> ${pct(m.acceptance)} of due deliverables are accepted.`
      : '<strong>Scope:</strong> acceptance rate not available.',
  );
  lines.push(
    isNum(m.passRate) || isNum(m.criticalDefects)
      ? `<strong>Quality:</strong> test pass rate ${pct(m.passRate)}; open critical defects ${isNum(m.criticalDefects) ? m.criticalDefects : 'N/A'}. A pass rate is only meaningful alongside the number of tests run.`
      : '<strong>Quality:</strong> no test or defect evidence entered. An untested module must not be read as defect-free.',
  );
  lines.push(
    `<strong>Risks / issues:</strong> ${isNum(m.highRisks) ? `${m.highRisks} unresolved high-priority item(s).` : 'not available — needs the current risk and issue register.'}`,
  );
  root.innerHTML = banner(state) + li(lines);
}

function variancePanel(root, { title, value, display, unfavourable, missingText, concernText, okText, causes, evidence, action }, state) {
  const tone = evidenceTone(state, value);
  let verdict = missingText;
  let cls = 'missing';
  if (isNum(value)) {
    cls = unfavourable ? 'investigate' : 'ok';
    verdict = unfavourable ? concernText : okText;
  }
  root.innerHTML = `<h3>${title}</h3>
    <p class="variance__value">${display} <span class="tag tag--${tone.cls}">${tone.tag}</span></p>
    <p class="variance__verdict variance__verdict--${cls}">${verdict}</p>
    <h4>Possible causes to investigate <small>(hypotheses, not confirmed)</small></h4>${li(causes)}
    <h4>Evidence needed</h4>${li(evidence)}
    <p class="variance__action"><strong>Linked action:</strong> ${action}</p>`;
}

export function renderVariancePanels({ schedule, cost }, state, m) {
  variancePanel(schedule, {
    title: 'Schedule variance investigation',
    value: m.scheduleGap,
    display: pp(m.scheduleGap),
    unfavourable: m.scheduleGap < 0,
    missingText: 'Cannot assess — enter planned and actual weighted completion.',
    concernText: 'Behind planned completion: investigation recommended.',
    okText: 'No adverse schedule variance in the entered data.',
    causes: [
      'Requirements rework or unclear acceptance criteria',
      'Dependency of listings and search on authentication',
      'Underestimated task effort for WBS 1.3.1–1.3.5',
      'Competing coursework or delayed code reviews',
    ],
    evidence: ['Overdue Trello cards with timestamps', 'GitHub merged PRs and review durations', 'Approved requirement changes'],
    action: 'CA-01 Schedule recovery review',
  }, state);

  variancePanel(cost, {
    title: 'Cost variance investigation',
    value: m.spendVariance,
    display: signedUgx(m.spendVariance),
    unfavourable: m.spendVariance < 0,
    missingText: 'Cannot assess — enter planned and actual spending to date.',
    concernText: 'Spending above planned-to-date: investigation recommended.',
    okText: 'Spending is not above planned-to-date in the entered data.',
    causes: [
      'Unplanned hosting, domain or service costs',
      'Repeated transport or stakeholder-engagement expenses',
      'Underestimated testing or data costs',
      'Spending booked to the wrong phase or to shared costs',
    ],
    evidence: ['Itemised receipts and expense ledger', 'Approved time-phased cost plan', 'Remaining commitments'],
    action: 'CA-02 Spending reconciliation',
  }, state);
}

export function renderEvmPanel(root, state, m) {
  const { evm } = m;
  const label = state.evidence === 'demo' ? '<p class="inline-flag inline-flag--illustrative">ILLUSTRATIVE EVM EXAMPLE — not Group B results.</p>' : '';

  if (!evm.active) {
    root.innerHTML = `<p class="evm__status evm__status--off">EVM panel inactive</p>
      <p>Formal EVM needs PV, EV and AC supplied separately, EV based on documented budget weights, and all three marked verified.</p>
      ${li(evm.blockers)}
      <p>Until then, report only the simple gaps above and state <em>EVM not calculated — insufficient validated evidence</em>.</p>`;
    return;
  }

  const bacNote = isNum(state.evmBac)
    ? `BAC supplied: ${ugx(state.evmBac)}.`
    : 'No separate BAC supplied; the UGX 20,000,000 total (including contingency) is not assumed to be the BAC.';
  root.innerHTML = `${label}<p class="evm__status evm__status--on">EVM panel active (inputs user-marked verified)</p>
    <dl class="evm__grid">
      <div><dt>PV</dt><dd>${ugx(state.evmPv)}</dd></div>
      <div><dt>EV</dt><dd>${ugx(state.evmEv)}</dd></div>
      <div><dt>AC</dt><dd>${ugx(state.evmAc)}</dd></div>
      <div><dt>SV = EV − PV</dt><dd>${signedUgx(evm.sv)}</dd></div>
      <div><dt>CV = EV − AC</dt><dd>${signedUgx(evm.cv)}</dd></div>
      <div><dt>SPI = EV ÷ PV</dt><dd>${ratio(evm.spi)}</dd></div>
      <div><dt>CPI = EV ÷ AC</dt><dd>${ratio(evm.cpi)}</dd></div>
    </dl>
    <p class="chart-note">${bacNote} SPI/CPI show N/A when PV/AC is zero.</p>`;
}
