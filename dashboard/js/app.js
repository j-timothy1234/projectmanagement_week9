import { defaults, phases, actions } from './data.js';
import { calculate, money, signed } from './metrics.js';

const $ = (id) => document.getElementById(id);
const keys = Object.keys(defaults);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function populate(data) {
  for (const key of keys) {
    $(key).value = data[key];
  }
  render();
}

function read() {
  const data = {};

  for (const key of keys) {
    if (key === 'evidence') {
      data[key] = $(key).value;
      continue;
    }

    const number = Number($(key).value);
    data[key] = Number.isFinite(number) ? Math.max(0, number) : 0;
  }

  data.week = clamp(Math.round(data.week), 1, 16);
  data.planned = clamp(data.planned, 0, 100);
  data.actual = clamp(data.actual, 0, 100);
  data.done = Math.min(Math.floor(data.done), Math.floor(data.due));
  data.due = Math.floor(data.due);
  data.defects = Math.floor(data.defects);
  data.risks = Math.floor(data.risks);

  return data;
}

function card(label, value, note) {
  return `<div class="card"><div class="label">${label}</div><div class="value">${value}</div><div class="note">${note}</div></div>`;
}

function render() {
  const data = read();
  const metrics = calculate(data);
  const demo = data.evidence !== 'verified';

  $('cards').innerHTML =
    card('Reporting week', `${data.week} / 16`, 'WBS schedule') +
    card(
      'Schedule gap',
      signed(metrics.gap, ' pp'),
      metrics.gap < 0
        ? 'Behind planned progress'
        : 'At or ahead of planned progress',
    ) +
    card(
      'Simple cost variance',
      money(metrics.simpleCV),
      metrics.simpleCV < 0
        ? 'Spending above plan'
        : 'Spending at or below plan',
    ) +
    card(
      'Due work packages',
      `${data.done} / ${data.due}`,
      metrics.scope === null
        ? 'No due packages recorded'
        : `${metrics.scope.toFixed(1)}% completed`,
    ) +
    card('Open defects', data.defects, 'Requires verified defect log') +
    card(
      'High risks / issues',
      data.risks,
      'Requires verified risk/issue register',
    );

  for (const [id, value] of [
    ['plannedBar', data.planned],
    ['actualBar', data.actual],
  ]) {
    $(id).style.width = value + '%';
  }

  $('plannedLabel').textContent = data.planned + '%';
  $('actualLabel').textContent = data.actual + '%';

  const scale = Math.max(1, data.plannedCost, data.actualCost);
  $('costPlanBar').style.width = (100 * data.plannedCost) / scale + '%';
  $('costActualBar').style.width = (100 * data.actualCost) / scale + '%';
  $('costPlanLabel').textContent = money(data.plannedCost);
  $('costActualLabel').textContent = money(data.actualCost);

  $('metrics').innerHTML = [
    ['PV (proxy)', money(metrics.pv)],
    ['EV (proxy)', money(metrics.ev)],
    ['AC', money(metrics.ac)],
    ['SV (proxy)', money(metrics.sv)],
    ['CV (proxy)', money(metrics.cv)],
    [
      'SPI (proxy)',
      metrics.spi === null ? 'N/A' : metrics.spi.toFixed(2),
    ],
    [
      'CPI (proxy)',
      metrics.cpi === null ? 'N/A' : metrics.cpi.toFixed(2),
    ],
  ]
    .map(([key, value]) => `<div><span>${key}</span><strong>${value}</strong></div>`)
    .join('');

  $('phases').innerHTML = phases
    .map(
      ([id, title, weeks]) =>
        `<div class="phase"><span><strong>${id}</strong> ${title}</span><span>W${weeks}</span></div>`,
    )
    .join('');

  $('actions').innerHTML = actions
    .map(
      (action) =>
        `<div class="action"><strong>${action.name}</strong><p><b>Owner:</b> ${action.owner}</p><p><b>Due:</b> ${action.due}</p><p><b>Success:</b> ${action.measure}</p></div>`,
    )
    .join('');

  $('trend').innerHTML = Array.from({ length: 16 }, (_, index) => {
    const week = index + 1;
    const current = week === data.week ? 'current' : '';
    const height = Math.max(4, (100 * week) / 16);
    const label =
      index === 0 || index === 3 || index === 7 || index === 11 || index === 15
        ? week
        : '';

    return `<div class="${current}" style="height:${height}%"><span>${label}</span></div>`;
  }).join('');

  $('interpretation').textContent =
    `${demo ? 'DEMONSTRATION ONLY: These values are not verified EasyStay actuals. ' : 'USER MARKED AS VERIFIED: confirm supporting evidence before submission. '}` +
    `At week ${data.week}, reported completion is ${data.actual}% against ${data.planned}% planned (gap ${signed(metrics.gap, ' percentage points')}). ` +
    `Reported expenditure is ${money(data.actualCost)} against ${money(data.plannedCost)} planned (simple cost variance ${money(metrics.simpleCV)}). ` +
    `${metrics.gap < 0 ? 'The schedule gap warrants investigation.' : 'The schedule is at or ahead of the stated completion target.'} ` +
    `${metrics.simpleCV < 0 ? 'Expenditure is above the stated spending plan.' : 'Expenditure is not above the stated spending plan.'} ` +
    'EVM outputs are budget-percentage proxies unless the team has validated budget-weighted earned value.';

  document.querySelector('.badge').textContent = demo
    ? 'DEMONSTRATION DATA — NOT VERIFIED'
    : 'USER-MARKED VERIFIED — CHECK EVIDENCE';
}

for (const key of keys) {
  $(key).addEventListener('input', render);
}

$('reset').addEventListener('click', () => populate(defaults));
$('print').addEventListener('click', () => window.print());

populate(defaults);
