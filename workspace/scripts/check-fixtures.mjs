import fixtures from '../src/engine/fixtures.json' with { type: 'json' };
import { project } from '../src/engine/401k.mjs';
import { calculateRetirement } from '../src/engine/retirement.mjs';
import { getDeferralLimit } from '../src/engine/limits.mjs';

function equal(actual, expected, label) {
  const same = typeof expected === 'number' ? Math.abs(actual - expected) < 1e-7 : actual === expected;
  if (!same) throw new Error(`${label}: expected ${expected}, received ${actual}`);
}

function checkArray(actual, expected, label) {
  if (!Array.isArray(actual) || actual.length !== expected.length) {
    throw new Error(`${label}: expected ${expected?.length} rows, received ${actual?.length}`);
  }
  expected.forEach((value, index) => equal(actual[index], value, `${label}[${index}]`));
}

for (const fixture of fixtures) {
  try {
    if (fixture.kind === 'projection') {
      const result = project(fixture.input);
      equal(result.ok, true, 'projection ok');
      for (const [key, path] of Object.entries({ balances: 'balance', employees: 'employee', matches: 'match', earnings: 'earnings', capped: 'capped', limitReached: 'limitReached' })) {
        if (fixture.expected[key]) checkArray(result.rows.map((row) => row[path]), fixture.expected[key], `${fixture.id}.${key}`);
      }
    } else if (fixture.kind === 'limits') {
      for (const item of fixture.expected) equal(getDeferralLimit({ ageAtYearEnd: item.age, year: 2027 }), item.limit, `${fixture.id}.${item.age}`);
    } else if (fixture.kind === 'invalid-projection') {
      const result = project(fixture.input);
      equal(result.ok, false, 'invalid projection rejected');
      equal(result.errors[fixture.expected.field], fixture.expected.code, `${fixture.id}.error`);
    } else if (fixture.kind === 'retirement') {
      const result = calculateRetirement(fixture.input);
      equal(result.ok, true, 'retirement ok');
      if (fixture.expected.retirementBalance !== undefined) equal(result.retirementBalance, fixture.expected.retirementBalance, `${fixture.id}.retirementBalance`);
      if (fixture.expected.depletedAt !== undefined) equal(result.depletedAt, fixture.expected.depletedAt, `${fixture.id}.depletedAt`);
      for (const [key, path] of Object.entries({ balances: 'balance', withdrawals: 'withdrawal', socialSecurity: 'socialSecurity' })) {
        if (fixture.expected[key]) checkArray(result.rows.map((row) => row[path]), fixture.expected[key], `${fixture.id}.${key}`);
      }
    }
    console.log(`PASS ${fixture.id}`);
  } catch (error) {
    console.error(`FAIL ${fixture.id}: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.exitCode) process.exit(process.exitCode);
