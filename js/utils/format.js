// Formatting helpers. Missing values (null/NaN) always render as "N/A", never 0.

const MINUS = '−';

export const isNum = (value) => typeof value === 'number' && Number.isFinite(value);

export function fmtNumber(value, decimals = 0) {
  if (!isNum(value)) return 'N/A';
  const text = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return (value < 0 && Number(text.replace(/,/g, '')) !== 0 ? MINUS : '') + text;
}

export const ugx = (value) => (isNum(value) ? `UGX ${fmtNumber(value)}` : 'N/A');

export const signedUgx = (value) => (isNum(value) && value > 0 ? '+' : '') + ugx(value);

export const pct = (value, decimals = 1) => (isNum(value) ? `${fmtNumber(value, decimals)}%` : 'N/A');

export function pp(value, decimals = 1) {
  if (!isNum(value)) return 'N/A';
  return `${value > 0 ? '+' : ''}${fmtNumber(value, decimals)} pp`;
}

export const ratio = (value) => (isNum(value) ? value.toFixed(2) : 'N/A');

export const count = (value) => (isNum(value) ? fmtNumber(value) : 'N/A');

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export function formatDate(iso) {
  if (!iso) return 'not set';
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'not set';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Evidence class of a displayed value, matching the on-screen legend.
// Returns a CSS modifier and a human label; missing values are never coloured.
export function evidenceTone(state, value) {
  if (!isNum(value)) return { cls: 'missing', tag: 'Missing evidence' };
  if (state.evidence === 'demo') return { cls: 'illustrative', tag: 'Illustrative example' };
  if (state.evidence === 'verified') return { cls: 'verified', tag: 'Verified actual (user-marked)' };
  return { cls: 'unverified', tag: 'Entered, not verified' };
}
