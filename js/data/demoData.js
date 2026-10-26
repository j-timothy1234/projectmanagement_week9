// HYPOTHETICAL teaching example. These are NOT Group B results.
// Loaded only when the user presses "Load hypothetical example".
import { emptyState } from './projectPlan.js';

export function demoState() {
  return {
    ...emptyState(),
    evidence: 'demo',
    reportingWeek: 9,
    plannedProgress: 40,
    actualProgress: 32,
    plannedSpend: 8000000,
    actualSpend: 8600000,
    // Illustrative scope/quality/risk values so every KPI card can be demonstrated.
    dueDeliverables: 12,
    acceptedDeliverables: 8,
    testsRun: 50,
    testsPassed: 43,
    criticalDefects: 2,
    highRisks: 3,
    // Separate EVM illustration: PV=8.0m, EV=6.4m, AC=8.6m.
    evmPv: 8000000,
    evmEv: 6400000,
    evmAc: 8600000,
    evmWeightsDocumented: true,
    evmVerified: true,
  };
}
