
const KEY_LABELS = {
  rice: 'Rice',
  viand: 'Viand',
  sugar: 'Sugar',
  milk: 'Milk',
  oil: 'Oil',
  snacks: 'Snacks',
  otherFood: 'Other Food Expenses',

  tuitionFees: 'Tuition Fees',
  miscellaneousFees: 'Miscellaneous Fees',
  schoolSupplies: 'School Supplies',
  transportation: 'Transportation',
  rentDormitory: 'Rent/Dormitory',
  otherEducation: 'Other Education Expenses',

  firewood: 'Firewood',
  gasTank: 'Gas Tank',
  caregivers: 'Caregivers',
  laundry: 'Laundry',
  hygiene: 'Hygiene',
  clothings: 'Clothings',
  otherFamily: 'Other Family Expenses',

  electricBill: 'Electric Bill',
  waterBill: 'Water Bill',
  subscription: 'Subscription',
  mobileLoad: 'Mobile Load',
  otherMonthly: 'Other Monthly Expenses'
};

export const expensesValueReducer = (keyField, valueField) => (rows) =>
  rows.reduce((acc, row) => {
    const rawKey = row[keyField];
    const labelKey = KEY_LABELS[rawKey] ?? rawKey;

    acc[labelKey] = Math.trunc(Number(row[valueField]) || 0);
    return acc;
  }, {});


export const keyValueReducer = (keyField, valueField) => (rows) =>
  rows.reduce((acc, row) => {
    acc[row[keyField]] = Number(row[valueField]);
    return acc;
  }, {});

export const nestedReducer = (keyField, fields) => (rows) =>
  rows.reduce((acc, row) => {
    acc[row[keyField]] = fields.reduce((obj, field) => {
      obj[field] = Number(row[field]);
      return obj;
    }, {});
    return acc;
  }, {});
