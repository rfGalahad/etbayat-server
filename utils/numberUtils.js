export const parseIncome = (value) => {
  if (!value) return 0;
  const parsed = parseFloat(value.toString().replace(/,/g, '').trim());
  return isNaN(parsed) ? 0 : parsed;
};