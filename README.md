# EasyStay Week 9 — Submission package

## Contents
- `Week9_Theoretical_Deliverables.md` — all four Week 9 outputs, methodology, status report, analysis and action plan.
- `dashboard/index.html` — interactive one-page dashboard.
- `dashboard/css/styles.css` — independent presentation layer.
- `dashboard/js/data.js` — project schedule, proposed actions and **illustrative** default inputs.
- `dashboard/js/metrics.js` — reusable KPI/EVM calculations.
- `dashboard/js/app.js` — inputs, rendering and print support.

## Run locally
Because JavaScript modules are used, start a local web server from the `dashboard` directory:

```bash
cd dashboard
python3 -m http.server 8000
```

Open `http://localhost:8000` in your browser. No frameworks, build tools or external libraries are required.

## Before academic submission
1. Obtain an approved schedule baseline (resolve charter 13 weeks versus WBS 16 weeks).
2. Confirm whether UGX 1,750,000 is an approved cost baseline or merely a ceiling.
3. Replace **all** demo figures with verifiable dated actuals from GitHub/Trello, QA and financial records.
4. If no budget-weighted earned value records exist, state EVM is not calculated; do not pass the dashboard's proxy as formal EVM.
5. Assign agreed calendar dates to corrective actions and confirm owners.
6. Save a print/PDF snapshot of the verified dashboard and attach it to the theoretical report.

No data is persisted or transmitted by the dashboard. Refreshing the page restores demonstration values.
# projectmanagement_week9
