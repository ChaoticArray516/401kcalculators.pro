import { getLimitInfo } from './limits.mjs';
import { readNumber, retirementFields, validateValues } from './validate.mjs';

export function calculateRetirement(input) {
  const values = Object.fromEntries(retirementFields.map((name) => [name, Number(input[name])]));
  const errors = validateValues(values, retirementFields);
  const socialSecurity = input.socialSecurity === '' || input.socialSecurity === null || input.socialSecurity === undefined
    ? null
    : readNumber(input.socialSecurity);
  if (input.socialSecurity !== '' && input.socialSecurity !== null && input.socialSecurity !== undefined && socialSecurity === null) {
    errors.socialSecurity = 'not-a-number';
  } else if (socialSecurity !== null && (socialSecurity < 0 || socialSecurity > 1000000)) {
    errors.socialSecurity = 'range:0:1000000';
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  let balance = values.currentBalance;
  const accumulationYears = values.retirementAge - values.currentAge;
  for (let index = 0; index < accumulationYears; index += 1) {
    const { limit } = getLimitInfo({ ageAtYearEnd: values.currentAge + index, year: 2027 + index });
    const contribution = Math.min(values.annualContribution, limit);
    balance = balance * (1 + values.preRetirementReturn) + contribution;
  }
  const retirementBalance = balance;

  const rows = [];
  const withdrawalYears = values.lifeExpectancy - values.retirementAge;
  let depletedAt = null;
  for (let index = 0; index < withdrawalYears; index += 1) {
    const age = values.retirementAge + index;
    const withdrawal = retirementBalance * values.initialWithdrawalRate * (1 + values.inflation) ** index;
    const earnings = balance * values.postRetirementReturn;
    balance = Math.max(0, balance + earnings - withdrawal);
    if (balance === 0 && depletedAt === null) depletedAt = age;
    rows.push({ age, withdrawal, earnings, balance, socialSecurity });
    if (depletedAt !== null) break;
  }

  return { ok: true, retirementBalance, rows, depletedAt };
}
