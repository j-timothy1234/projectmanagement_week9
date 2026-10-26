// Self-tests for calculations, validation and storage merging. Run: node tests/selftest.mjs
import assert from 'node:assert/strict';
import { BUDGET_TOTAL } from '../js/data/projectPlan.js';
import { emptyState } from '../js/data/projectPlan.js';
import { demoState } from '../js/data/demoData.js';
import { calculate } from '../js/utils/metrics.js';
import { fmtNumber, pct, ugx } from '../js/utils/format.js';
import { validate } from '../js/services/validation.js';
import { mergeState } from '../js/services/storage.js';

let passed = 0;
const test = (name, fn) => {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
};

test('budget lines sum to UGX 20,000,000', () => assert.equal(BUDGET_TOTAL, 20000000));

test('empty state: every KPI is null (N/A), not zero', () => {
  const m = calculate(emptyState());
  for (const key of ['scheduleGap', 'spendVariance', 'acceptance', 'passRate', 'criticalDefects', 'highRisks']) {
    assert.equal(m[key], null, key);
  }
  assert.equal(m.evm.active, false);
  assert.equal(pct(m.acceptance), 'N/A');
  assert.equal(ugx(m.spendVariance), 'N/A');
});

test('demo example: schedule gap -8 pp and spending variance -600,000', () => {
  const m = calculate(demoState());
  assert.equal(m.scheduleGap, -8);
  assert.equal(m.spendVariance, -600000);
  assert.equal(m.acceptance, (100 * 8) / 12);
  assert.equal(m.passRate, 86);
});

test('demo EVM: SV -1.6m, CV -2.2m, SPI 0.80, CPI ~0.74', () => {
  const { evm } = calculate(demoState());
  assert.equal(evm.active, true);
  assert.equal(evm.sv, -1600000);
  assert.equal(evm.cv, -2200000);
  assert.equal(evm.spi.toFixed(2), '0.80');
  assert.equal(evm.cpi.toFixed(2), '0.74');
});

test('EVM stays inactive unless PV/EV/AC are supplied, weighted and verified', () => {
  const base = { ...demoState() };
  assert.equal(calculate({ ...base, evmVerified: false }).evm.active, false);
  assert.equal(calculate({ ...base, evmWeightsDocumented: false }).evm.active, false);
  assert.equal(calculate({ ...base, evmEv: null }).evm.active, false);
  assert.equal(calculate({ ...base, evmEv: null }).evm.cv, null);
});

test('division by zero is guarded', () => {
  const m = calculate({ ...demoState(), evmPv: 0, evmAc: 0, dueDeliverables: 0, testsRun: 0, testsPassed: 0 });
  assert.equal(m.evm.spi, null);
  assert.equal(m.evm.cpi, null);
  assert.equal(m.acceptance, null);
  assert.equal(m.passRate, null);
});

test('zero is a real value, distinct from missing', () => {
  const m = calculate({ ...emptyState(), criticalDefects: 0, highRisks: 0 });
  assert.equal(m.criticalDefects, 0);
  assert.equal(m.highRisks, 0);
});

test('validation rejects out-of-range, negative and inconsistent inputs', () => {
  const { clean, errors } = validate({
    ...emptyState(), plannedProgress: 120, actualSpend: -5, testsRun: 10, testsPassed: 12,
    dueDeliverables: 3, acceptedDeliverables: 4, highRisks: 1.5, reportingWeek: 17,
  });
  for (const key of ['plannedProgress', 'actualSpend', 'testsPassed', 'acceptedDeliverables', 'highRisks', 'reportingWeek']) {
    assert.ok(errors[key], `error for ${key}`);
    assert.equal(clean[key], null, `${key} cleaned to null`);
  }
});

test('validation accepts boundary values and flags module completion', () => {
  const state = emptyState();
  state.modules[0].completion = 101;
  state.plannedProgress = 100;
  state.actualProgress = 0;
  const { clean, errors } = validate(state);
  assert.equal(errors.plannedProgress, undefined);
  assert.equal(clean.actualProgress, 0);
  assert.ok(errors['module:1.3.1:completion']);
  assert.equal(clean.modules[0].completion, null);
});

test('mergeState drops malformed and unknown data', () => {
  const merged = mergeState({ plannedProgress: 'x', actualProgress: 12, evidence: 'bogus', extra: 1, modules: [{ id: '1.3.1', completion: 50 }] });
  assert.equal(merged.plannedProgress, null);
  assert.equal(merged.actualProgress, 12);
  assert.equal(merged.evidence, 'unverified');
  assert.equal('extra' in merged, false);
  assert.equal(merged.modules[0].completion, 50);
  assert.equal(merged.modules.length, 5);
  assert.deepEqual(mergeState(null), emptyState());
});

test('formatting uses a proper minus sign and N/A for missing', () => {
  assert.equal(fmtNumber(-600000), '−600,000');
  assert.equal(fmtNumber(null), 'N/A');
  assert.equal(fmtNumber(-0.0001, 1), '0.0');
});

console.log(`\n${passed} tests passed`);
