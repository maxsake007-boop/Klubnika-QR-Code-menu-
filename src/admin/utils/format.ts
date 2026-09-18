// Utility for Uzbek Som formatting and currency display

export const formatMoney = (amount: number): string => {
  const rounded = Math.round(amount || 0);
  return new Intl.NumberFormat('ru-RU').format(rounded) + ' сум';
};

export const formatNumber = (val: number): string => {
  return new Intl.NumberFormat('ru-RU').format(Math.round(val || 0));
};

/**
 * Formats a number or numeric string with dots as thousand separators.
 * Example: 25000 -> "25.000", 100000 -> "100.000", 1500000 -> "1.500.000"
 */
export const formatWithDots = (val: string | number | undefined | null): string => {
  if (val === '' || val === null || val === undefined) return '';
  const digits = String(val).replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Extracts raw numeric value from a string formatted with dots.
 * Example: "25.000" -> 25000
 */
export const parseDotsNumber = (val: string | number | undefined | null): number => {
  if (val === '' || val === null || val === undefined) return 0;
  const digits = String(val).replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
};

// Calculate 12% VAT (standard in Uzbekistan)
export const calculateVAT = (total: number, vatRate = 12): { vat: number; subtotal: number } => {
  const vat = Math.round((total * vatRate) / (100 + vatRate));
  const subtotal = total - vat;
  return { vat, subtotal };
};
