// All initial measurements are ILLUSTRATIVE, not recorded project actuals.
export const defaults = {
  week: 9,
  budget: 1750000,
  planned: 40,
  actual: 32,
  plannedCost: 700000,
  actualCost: 760000,
  done: 8,
  due: 12,
  defects: 5,
  risks: 3,
  evidence: 'demo',
};

export const phases = [
  ['1.1', 'Initiation & requirements', '1–3'],
  ['1.2', 'System design', '4–6'],
  ['1.3', 'Core development', '7–10'],
  ['1.4', 'Booking, messaging & reviews', '11–13'],
  ['1.5', 'Admin dashboard & integration', '14'],
  ['1.6', 'Usability & functionality testing', '15'],
  ['1.7', 'Documentation & closure', '16'],
];

export const actions = [
  {
    name: 'Validate overdue core-development work',
    owner: 'Habimana Adelin (PM) with Ngabirano Haniel A (Technical Lead)',
    measure:
      'All overdue tasks reviewed; revised dates and owners entered in Trello',
    due: 'Team to agree',
  },
  {
    name: 'Review budget and spending evidence',
    owner: 'Habimana Adelin (PM)',
    measure:
      'Receipts reconciled and approved planned-vs-actual cost report produced',
    due: 'Team to agree',
  },
  {
    name: 'Triage defects and high-priority risks',
    owner: 'Muhumuza Arnold (QA Lead)',
    measure:
      'Every open defect/risk assigned severity, owner and next action',
    due: 'Team to agree',
  },
];
