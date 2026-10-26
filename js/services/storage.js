// Persistence: localStorage plus JSON export/import. All access is wrapped in
// try/catch because storage can be blocked (private windows, disabled cookies).
import { emptyState } from '../data/projectPlan.js';

const KEY = 'easystay-week9-dashboard-v1';
const APP_ID = 'easystay-week9-dashboard';
const EVIDENCE_VALUES = ['unverified', 'verified', 'demo'];

// Accept a value only if it has the same type as the default; null defaults take numbers.
function coerce(base, value) {
  if (base === null) return typeof value === 'number' && Number.isFinite(value) ? value : null;
  return typeof value === typeof base ? value : base;
}

function mergeInto(base, partial) {
  const out = {};
  for (const key of Object.keys(base)) {
    if (Array.isArray(base[key])) {
      const incoming = Array.isArray(partial?.[key]) ? partial[key] : [];
      out[key] = base[key].map((item) => {
        const match = incoming.find((entry) => entry && entry.id === item.id);
        return match ? mergeInto(item, match) : item;
      });
    } else {
      out[key] = partial && key in partial ? coerce(base[key], partial[key]) : base[key];
    }
  }
  return out;
}

// Merge untrusted data onto the default state; unknown/ill-typed fields are dropped.
export function mergeState(partial) {
  const merged = mergeInto(emptyState(), partial && typeof partial === 'object' ? partial : {});
  if (!EVIDENCE_VALUES.includes(merged.evidence)) merged.evidence = 'unverified';
  return merged;
}

export function load() {
  try {
    const text = localStorage.getItem(KEY);
    return text ? mergeState(JSON.parse(text)) : emptyState();
  } catch {
    return emptyState();
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clear() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable: nothing to clear */
  }
}

export function exportJson(state) {
  const payload = { app: APP_ID, version: 1, exportedAt: new Date().toISOString(), state };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `easystay-week9-dashboard-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

export async function importJson(file) {
  const parsed = JSON.parse(await file.text());
  if (!parsed || parsed.app !== APP_ID || typeof parsed.state !== 'object') {
    throw new Error('This file is not an EasyStay Week 9 dashboard export.');
  }
  return mergeState(parsed.state);
}
