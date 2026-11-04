// Helcyon AI Utility Formatters & Helpers

/**
 * Formats a numeric monetary value into a localized currency string.
 * Defaults to Indian Rupee (INR) with Indian numbering format (e.g. ₹1,50,000.00)
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'INR',
  showDecimals: boolean = true
): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    amount = 0;
  }

  // Ensure 2 decimal places with proper rounding
  const roundedAmount = Math.round(amount * 100) / 100;

  try {
    const locale = currencyCode === 'INR' ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(roundedAmount);
  } catch (err) {
    // Fallback if locale or currency code is unrecognized
    const symbol = currencyCode === 'INR' ? '₹' : '$';
    return `${symbol}${roundedAmount.toLocaleString('en-US', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    })}`;
  }
}

/**
 * Formats a raw ISO date string (YYYY-MM-DD) into a human-readable string.
 */
export function formatDate(dateString: string, formatStyle: 'short' | 'medium' | 'full' = 'medium'): string {
  if (!dateString) return '—';
  
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;
  
  const dateObj = new Date(year, month - 1, day);

  if (formatStyle === 'short') {
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else if (formatStyle === 'medium') {
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } else {
    return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
  }
}

/**
 * Calculates percentage safely without division by zero.
 */
export function calculatePercentage(part: number, total: number): number {
  if (!total || total <= 0) return 0;
  const pct = (part / total) * 100;
  return Math.min(Math.round(pct * 10) / 10, 100);
}

/**
 * Classnames concatenation helper (lightweight alternative to cn/clsx)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

