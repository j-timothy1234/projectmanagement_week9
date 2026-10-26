# EasyStay Week 9 — Project Monitoring Dashboard

SWE 3103 Software Project Management · Group B · MUST.
A **monitoring artifact** for the EasyStay project (not the booking product's admin panel), built with HTML5, CSS3 and vanilla JavaScript ES modules. No frameworks, backend or build tools.

## Run

ES modules need a web server (they do not load from `file://`):

```bash
cd easy-stay-week9-dashboard
python3 -m http.server 8000
```

Open <http://localhost:8000>.

## Self-tests

```bash
node tests/selftest.mjs      # or: npm test
```

Covers the calculations (including missing data and division by zero), validation, storage merging and the 20,000,000 budget total.

## Ground rules built in

- The 16-week WBS and the UGX 20,000,000 budget are **provisional** until the baseline is approved.
- The dashboard starts as **DATA NOT VERIFIED**; every actual KPI shows `N/A` / `—` until entered. Missing is never treated as zero.
- Red/green colouring is applied only when the user marks the data *Verified*.
- **Load hypothetical example** fills clearly labelled teaching numbers (40% planned vs 32% actual, UGX 8.0m planned vs 8.6m spent; EVM PV 8.0m, EV 6.4m, AC 8.6m). Test, defect, deliverable and risk values in the example are also invented. None of it is Group B data. Editing any field afterwards drops the *illustrative* label.
- EVM is optional and activates only when PV, EV and AC are entered separately, budget weights are documented, and all are marked verified. EV is never derived from a raw percentage, and the UGX 20m total (with contingency) is not assumed to be the BAC.
- Phase timeline totals are independent of the manually edited module table.

## Where to enter verified figures

Open **Performance analysis → Enter verified figures**:

| Section | Fields |
|---|---|
| Reporting | status date, reporting week, evidence status, baseline approved |
| Schedule | planned / actual weighted completion (%) |
| Cost | planned / actual spending to date (UGX) |
| Scope, quality, risk | deliverables due / accepted, tests run / passed, open critical defects, high risks |
| Optional EVM | BAC, PV, EV, AC, "weights documented", "verified" |

Set **Evidence status** to *Verified by Group B* only when records back the numbers. WBS 1.3 module status (owner, dates, evidence link, completion, blocked/at-risk flag) and the corrective-action due dates and evidence are edited directly on the **Dashboard** tab.

Data is saved in this browser's `localStorage`. Use **Export JSON / Import JSON** to move or back it up, **Reset** to clear, **Print** for an A4 landscape summary (choose "Background graphics" if the browser asks).

## Demonstrating to the lecturer

1. Open the dashboard: point out the *DATA NOT VERIFIED* banner, `N/A` KPIs and the provisional badges.
2. Click **Load hypothetical example**: the purple banner shows these are teaching numbers; schedule gap −8 pp and spending variance −UGX 600,000 appear.
3. Open **Performance analysis**: formulas, live calculations, interpretation and the two variance panels. Show that simple spending variance (−600,000) differs from EVM CV (−2,200,000).
4. Untick *verified* in the EVM inputs to show the panel deactivating with reasons.
5. Try invalid input (passed tests > tests run, 120% progress) to show validation.
6. **Reset**, then enter real figures, set evidence to *Verified*, and **Print** / save as PDF for the submission.

## Structure

```
index.html
css/        variables.css  layout.css  components.css  print.css
js/main.js                      state, events, rendering
js/data/    projectPlan.js  demoData.js
js/services/ storage.js  validation.js
js/utils/   format.js  metrics.js
js/components/ kpiCards  charts  wbsTable  actionTable  dataForm  analysis
tests/selftest.mjs
```
