// Documented / provisional plan data for EasyStay (SWE 3103, Group B).
// The 16-week WBS and the UGX 20,000,000 budget are PROVISIONAL until the
// team records a formally approved baseline. Nothing here is a measured actual.

export const TOTAL_WEEKS = 16;

// WBS phases with provisional week ranges and proposed budgets (UGX).
export const PHASES = [
  { id: '1.1', name: 'Initiation and requirements', budgetName: 'Initiation and requirements', start: 1, end: 3, budget: 1500000 },
  { id: '1.2', name: 'System design', budgetName: 'System design', start: 4, end: 6, budget: 2200000 },
  { id: '1.3', name: 'Core development', budgetName: 'Core development', start: 7, end: 10, budget: 5500000 },
  { id: '1.4', name: 'Booking, messaging and reviews', budgetName: 'Booking, messaging and reviews', start: 11, end: 13, budget: 3400000 },
  { id: '1.5', name: 'Admin dashboard and integration', budgetName: 'Admin dashboard and integration', start: 14, end: 14, budget: 2000000 },
  { id: '1.6', name: 'Usability and functionality testing', budgetName: 'Testing and evaluation', start: 15, end: 15, budget: 1700000 },
  { id: '1.7', name: 'Documentation, presentation and closure', budgetName: 'Documentation and closure', start: 16, end: 16, budget: 1200000 },
];

// Budget distribution = phases + shared costs + contingency.
export const BUDGET_LINES = [
  ...PHASES.map((p) => ({ id: p.id, name: p.budgetName, amount: p.budget })),
  { id: 'SH', name: 'Shared project costs', amount: 1500000 },
  { id: 'CR', name: 'Contingency reserve', amount: 1000000 },
];

export const BUDGET_TOTAL = BUDGET_LINES.reduce((sum, line) => sum + line.amount, 0);

// WBS 1.3 Core Development work packages (Weeks 7-10).
export const CORE_MODULES = [
  { id: '1.3.1', name: 'Student registration / authentication' },
  { id: '1.3.2', name: 'Provider registration / authentication' },
  { id: '1.3.3', name: 'Listing management' },
  { id: '1.3.4', name: 'Search / filtering' },
  { id: '1.3.5', name: 'Accommodation details' },
];

// Proposed corrective / preventive actions. Due dates are relative and
// provisional; the team edits them in the dashboard.
export const ACTIONS = [
  {
    id: 'CA-01',
    title: 'Schedule recovery review',
    owner: 'Habimana Adelin / Ngabirano Haniel A',
    measure: 'Every overdue WBS 1.3 task has a revised date, owner and acceptance criteria',
    due: 'Within 3 days of the status review (provisional)',
  },
  {
    id: 'CA-02',
    title: 'Spending reconciliation',
    owner: 'Habimana Adelin',
    measure: '100% of recorded expenditure matched to receipts; revised forecast approved',
    due: 'Within 5 days of the status review (provisional)',
  },
  {
    id: 'PA-03',
    title: 'Defect and risk triage',
    owner: 'Muhumuza Arnold',
    measure: 'Every open defect and high risk has a severity, owner and next review date',
    due: 'Before the next progress meeting (provisional)',
  },
  {
    id: 'PA-04',
    title: 'Requirements traceability',
    owner: 'Jobinge Timothy Osbert',
    measure: 'Each implemented WBS 1.3 feature traced to a requirement and a test case',
    due: 'Within 7 days of the status review (provisional)',
  },
];

// Blank state: every measured value is null (missing), never zero.
export function emptyState() {
  return {
    statusDate: '',
    reportingWeek: 9,
    baselineApproved: false,
    evidence: 'unverified', // 'unverified' | 'verified' | 'demo'
    plannedProgress: null,
    actualProgress: null,
    plannedSpend: null,
    actualSpend: null,
    dueDeliverables: null,
    acceptedDeliverables: null,
    testsRun: null,
    testsPassed: null,
    criticalDefects: null,
    highRisks: null,
    evmPv: null,
    evmEv: null,
    evmAc: null,
    evmBac: null,
    evmWeightsDocumented: false,
    evmVerified: false,
    modules: CORE_MODULES.map((m) => ({
      id: m.id,
      name: m.name,
      owner: '',
      plannedDate: '',
      actualDate: '',
      evidenceRef: '',
      completion: null,
      flag: 'none', // 'none' | 'at-risk' | 'blocked'
    })),
    actions: ACTIONS.map((a) => ({ ...a, evidenceRef: '' })),
  };
}
