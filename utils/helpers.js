export const parseIncome = (value) => {
  if (!value) return 0;
  const parsed = parseFloat(value.toString().replace(/,/g, '').trim());
  return isNaN(parsed) ? 0 : parsed;
};

export const formatDateForMySQL = (dateStr) => {
  if (!dateStr) return null;
  const [month, day, year] = dateStr.split('-');
  return `${year}-${month}-${day}`;
};

export const base64ToBuffer = (base64) => {
  const matches = base64.match(/^data:(.+);base64,(.+)$/);

  if (!matches) {
    throw new Error('Invalid base64 image');
  }

  return Buffer.from(matches[2], 'base64');
}

export const getNextFamilyId = (latestFamilyId, baseId) => {
  
  if (!latestFamilyId) {
    return `FID-${baseId}-A`;
  }

  const parts = latestFamilyId.split('-');
  const suffix = parts.pop(); // A, B, C...
  const nextSuffix = String.fromCharCode(suffix.charCodeAt(0) + 1);

  return [...parts, nextSuffix].join('-');
}


