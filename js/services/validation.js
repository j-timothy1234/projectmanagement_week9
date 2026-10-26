// Input validation. validate() never mutates its input: it returns a cleaned copy in
// which every invalid value is replaced by null (so metrics show N/A), plus an
// errors map keyed by field name (or "module:<id>:completion" for WBS rows).
import { isNum } from '../utils/format.js';

const PERCENT_FIELDS = ['plannedProgress', 'actualProgress'];
const AMOUNT_FIELDS = ['plannedSpend', 'actualSpend', 'evmPv', 'evmEv', 'evmAc', 'evmBac'];
const COUNT_FIELDS = [
  'dueDeliverables', 'acceptedDeliverables', 'testsRun', 'testsPassed', 'criticalDefects', 'highRisks',
];

export function validate(raw) {
  const errors = {};
  const clean = { ...raw };

  for (const key of PERCENT_FIELDS) {
    if (isNum(raw[key]) && (raw[key] < 0 || raw[key] > 100)) {
      errors[key] = 'Enter a percentage between 0 and 100.';
      clean[key] = null;
    }
  }

  for (const key of AMOUNT_FIELDS) {
    if (isNum(raw[key]) && raw[key] < 0) {
      errors[key] = 'Amounts cannot be negative.';
      clean[key] = null;
    }
  }

  for (const key of COUNT_FIELDS) {
    if (isNum(raw[key]) && (raw[key] < 0 || !Number.isInteger(raw[key]))) {
      errors[key] = 'Enter a whole number, zero or greater.';
      clean[key] = null;
    }
  }

  if (isNum(clean.testsPassed) && isNum(clean.testsRun) && clean.testsPassed > clean.testsRun) {
    errors.testsPassed = 'Passed tests cannot exceed tests run.';
    clean.testsPassed = null;
  }

  if (
    isNum(clean.acceptedDeliverables) &&
    isNum(clean.dueDeliverables) &&
    clean.acceptedDeliverables > clean.dueDeliverables
  ) {
    errors.acceptedDeliverables = 'Accepted deliverables cannot exceed deliverables due.';
    clean.acceptedDeliverables = null;
  }

  if (isNum(raw.reportingWeek) && (!Number.isInteger(raw.reportingWeek) || raw.reportingWeek < 1 || raw.reportingWeek > 16)) {
    errors.reportingWeek = 'Enter a week from 1 to 16.';
    clean.reportingWeek = null;
  }

  clean.modules = (raw.modules || []).map((module) => {
    if (isNum(module.completion) && (module.completion < 0 || module.completion > 100)) {
      errors[`module:${module.id}:completion`] = 'Completion must be between 0 and 100.';
      return { ...module, completion: null };
    }
    return module;
  });

  return { clean, errors };
}
