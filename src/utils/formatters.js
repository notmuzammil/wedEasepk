/**
 * Formatting helpers — Pakistani locale conventions.
 */

/**
 * Format a number as Pakistani Rupees.
 * Uses Intl with "en-IN" locale to get the lakh/crore grouping style.
 * e.g. formatPKR(150000) → "PKR 1,50,000"
 *
 * @param {number} amount
 * @returns {string}
 */
export function formatPKR(amount) {
  if (amount === undefined || amount === null) return 'PKR 0';
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `PKR ${formatted}`;
}

/**
 * Format a date string to a long, readable format.
 * e.g. formatDate('2025-12-15') → "15 December 2025"
 *
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format a date to a short display format.
 * e.g. formatShortDate('2025-12-15') → "15 Dec 2025"
 *
 * @param {string|Date} date
 * @returns {string}
 */
export function formatShortDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get a relative time description.
 * e.g. formatRelativeTime(new Date(Date.now() - 172800000)) → "2 days ago"
 *
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWk  = Math.floor(diffDay / 7);
  const diffMo  = Math.floor(diffDay / 30);
  const diffYr  = Math.floor(diffDay / 365);

  if (diffSec < 60)  return 'just now';
  if (diffMin < 60)  return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHr  < 24)  return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
  if (diffDay < 7)   return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  if (diffWk  < 4)   return `${diffWk} week${diffWk !== 1 ? 's' : ''} ago`;
  if (diffMo  < 12)  return `${diffMo} month${diffMo !== 1 ? 's' : ''} ago`;
  return `${diffYr} year${diffYr !== 1 ? 's' : ''} ago`;
}

/**
 * Extract initials from a full name (up to 2 letters).
 * e.g. getInitials('Ahmad Karimi') → "AK"
 *
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}
