/**
 * Centralized currency formatter for CivicOS Indian localization.
 * Uses Indian numbering system (e.g., 1,00,000) and INR symbol (₹).
 */
export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

/**
 * Formatter for hourly rates or small amounts where decimals might be needed.
 */
export const formatCurrencyCompact = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

/**
 * Strips currency symbol for use in charts or inputs while maintaining Indian formatting.
 */
export const formatNumberIndian = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);
