import { calculateRetirement } from '../engine/retirement.mjs';
import { bindForm, getValues, money, rangeMessage, showError } from './form-helpers.mjs';

const names = ['currentAge', 'retirementAge', 'currentBalance', 'annualContribution', 'preRetirementReturn', 'lifeExpectancy', 'initialWithdrawalRate', 'postRetirementReturn', 'inflation', 'socialSecurity'];

function tableHtml(rows, preview = false) {
  return `<table><caption id="${preview ? 'withdrawal-preview-caption' : 'withdrawal-table-caption'}">${preview ? 'First 3 years' : 'Withdrawal projection'}</caption><thead><tr><th scope="col">Age</th><th scope="col">Withdrawal</th><th scope="col">Investment earnings</th><th scope="col">Social Security estimate</th><th scope="col">Ending balance</th></tr></thead><tbody>${rows.map((row) => `<tr><th scope="row">${row.age}</th><td data-label="Withdrawal">${money.format(row.withdrawal)}</td><td data-label="Investment earnings">${money.format(row.earnings)}</td><td data-label="Social Security estimate">${row.socialSecurity === null ? 'Not included' : money.format(row.socialSecurity)}</td><td data-label="Ending balance">${money.format(row.balance)}</td></tr>`).join('')}</tbody></table>`;
}

export function bindRetirementForm(form) {
  if (!form) return;
  const tables = document.querySelectorAll('[data-withdrawal-table]');
  const summary = document.querySelector('[data-retirement-summary]');

  function compute({ validateAll = false, focusInvalid = false } = {}) {
    const result = calculateRetirement(getValues(form, names));
    if (!result.ok) {
      const fields = Object.keys(result.errors);
      if (validateAll) fields.forEach((name) => showError(form.elements[name], rangeMessage(result.errors[name])));
      if (focusInvalid && fields.length) form.elements[fields[0]].focus();
      return;
    }
    form.querySelectorAll('.field').forEach((field) => field.classList.remove('is-invalid'));
    tables.forEach((table) => {
      const preview = table.dataset.withdrawalPreview === 'true';
      table.innerHTML = tableHtml(preview ? result.rows.slice(0, 3) : result.rows, preview);
    });
    if (summary) summary.innerHTML = `Balance at retirement: <strong>${money.format(result.retirementBalance)}</strong>. <span class="result-status">${result.depletedAt === null ? 'The balance lasts past your life expectancy.' : `The balance is depleted at age ${result.depletedAt}.`}</span>`;
  }

  bindForm(form, compute);
}
