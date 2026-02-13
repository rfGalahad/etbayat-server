export const formatDateForMySQL = (dateStr) => {
  if (!dateStr) return null;
  const [month, day, year] = dateStr.split('-');
  return `${year}-${month}-${day}`;
};

export const formatMonthYearForMySQL = (monthYearStr) => {
  if (!monthYearStr) return null;
  const [month, year] = monthYearStr.split('-');
  return `${year}-${month}-01`;
};