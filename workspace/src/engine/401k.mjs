import { getLimitInfo } from './limits.mjs';
import { projectionFields, validateValues } from './validate.mjs';

export function project(input) {
  const values = Object.fromEntries(projectionFields.map((name) => [name, Number(input[name])]));
  const errors = validateValues(values, projectionFields);
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const years = values.retirementAge - values.currentAge;
  const rows = [];
  let balance = values.currentBalance;

  for (let index = 0; index < years; index += 1) {
    const year = 2027 + index;
    const age = values.currentAge + index;
    const salary = values.annualSalary * (1 + values.salaryGrowth) ** index;
    const { limit, assumed } = getLimitInfo({ ageAtYearEnd: age, year });
    const requested = salary * values.employeeRate;
    const employee = Math.min(requested, limit);
    const match = Math.min(employee, salary * values.matchCapRate) * values.matchRate;
    const earnings = balance * values.returnRate;
    balance += earnings + employee + match;
    rows.push({
      year,
      age,
      salary,
      employee,
      match,
      earnings,
      balance,
      limit,
      capped: requested > limit,
      limitReached: limit > 0 && employee === limit,
      assumed,
    });
  }

  return { ok: true, rows };
}
