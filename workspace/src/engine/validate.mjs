const rules = {
  currentAge: [18, 100],
  retirementAge: [19, 101],
  currentBalance: [0, 1000000000],
  annualSalary: [1, 10000000],
  employeeRate: [0, 1],
  salaryGrowth: [-0.5, 0.5],
  returnRate: [-0.99, 1],
  matchRate: [0, 5],
  matchCapRate: [0, 1],
  annualContribution: [0, 1000000],
  preRetirementReturn: [-0.99, 1],
  lifeExpectancy: [1, 120],
  initialWithdrawalRate: [0, 0.2],
  postRetirementReturn: [-0.99, 1],
  inflation: [-0.99, 0.5],
  socialSecurity: [0, 1000000],
};

export function readNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function validateValues(values, names) {
  const errors = {};
  for (const name of names) {
    const [min, max] = rules[name];
    const value = readNumber(values[name]);
    if (value === null) {
      errors[name] = 'not-a-number';
    } else if (value < min || value > max) {
      errors[name] = `range:${min}:${max}`;
    }
  }
  if (!errors.retirementAge && !errors.currentAge && values.retirementAge <= values.currentAge) {
    errors.retirementAge = 'after-current-age';
  }
  if ('lifeExpectancy' in values && !errors.lifeExpectancy && !errors.retirementAge && values.lifeExpectancy <= values.retirementAge) {
    errors.lifeExpectancy = 'after-retirement-age';
  }
  return errors;
}

export const projectionFields = [
  'currentAge',
  'retirementAge',
  'currentBalance',
  'annualSalary',
  'employeeRate',
  'salaryGrowth',
  'returnRate',
  'matchRate',
  'matchCapRate',
];

export const retirementFields = [
  'currentAge',
  'retirementAge',
  'currentBalance',
  'annualContribution',
  'preRetirementReturn',
  'lifeExpectancy',
  'initialWithdrawalRate',
  'postRetirementReturn',
  'inflation',
];
