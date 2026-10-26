// Pure calculation functions. No DOM access, so they can be self-tested in Node.
// Rule: a missing input yields null (shown as N/A), never 0; divisions are guarded.
import { isNum } from './format.js';

const divide = (a, b) => (isNum(a) && isNum(b) && b > 0 ? a / b : null);
const difference = (a, b) => (isNum(a) && isNum(b) ? a - b : null);

// Reasons the optional EVM panel is not active (empty list = ready).
export function evmBlockers(state) {
  const blockers = [];
  if (!isNum(state.evmPv)) blockers.push('Planned Value (PV) not supplied');
  if (!isNum(state.evmEv)) blockers.push('Earned Value (EV) not supplied');
  if (!isNum(state.evmAc)) blockers.push('Actual Cost (AC) not supplied');
  if (!state.evmWeightsDocumented) blockers.push('Budget weights behind EV not documented');
  if (!state.evmVerified) blockers.push('PV, EV and AC not explicitly marked verified');
  return blockers;
}

export function calculate(state) {
  // Simple, evidence-light indicators (always available when inputs exist).
  const scheduleGap = difference(state.actualProgress, state.plannedProgress); // pp
  const spendVariance = difference(state.plannedSpend, state.actualSpend); // planned - actual
  const acceptance = isNum(state.acceptedDeliverables)
    ? divide(100 * state.acceptedDeliverables, state.dueDeliverables)
    : null;
  const passRate = isNum(state.testsPassed) ? divide(100 * state.testsPassed, state.testsRun) : null;

  // Optional formal EVM: only when PV/EV/AC are separate, weighted and verified.
  const blockers = evmBlockers(state);
  const active = blockers.length === 0;
  const evm = {
    active,
    blockers,
    sv: active ? state.evmEv - state.evmPv : null,
    cv: active ? state.evmEv - state.evmAc : null,
    spi: active ? divide(state.evmEv, state.evmPv) : null,
    cpi: active ? divide(state.evmEv, state.evmAc) : null,
  };

  return {
    scheduleGap,
    spendVariance,
    acceptance,
    passRate,
    criticalDefects: isNum(state.criticalDefects) ? state.criticalDefects : null,
    highRisks: isNum(state.highRisks) ? state.highRisks : null,
    evm,
  };
}
