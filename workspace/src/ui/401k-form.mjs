import { project } from '../engine/401k.mjs';
import { bindForm, getValues, money, rangeMessage, showError } from './form-helpers.mjs';

const names = ['currentAge', 'retirementAge', 'currentBalance', 'annualSalary', 'employeeRate', 'salaryGrowth', 'returnRate', 'matchRate', 'matchCapRate'];

function limitText(row) {
  if (row.capped) return row.assumed ? 'Capped (2027 limits assumed)' : 'Capped at the 2027 limit';
  if (row.limitReached) return 'At the limit';
  return 'Within limit';
}

function tableHtml(rows, preview = false) {
  return `<table><caption id="${preview ? 'projection-preview-caption' : 'projection-table-caption'}">${preview ? 'First 3 years' : '401k projection'}</caption><thead><tr><th scope="col">Year</th><th scope="col">Age</th><th scope="col">Salary</th><th scope="col">Your contribution</th><th scope="col">Employer match</th><th scope="col">Investment earnings</th><th scope="col">Ending balance</th><th scope="col">Limit status</th></tr></thead><tbody>${rows.map((row) => `<tr><th scope="row">${row.year}</th><td data-label="Age">${row.age}</td><td data-label="Salary">${money.format(row.salary)}</td><td data-label="Your contribution">${money.format(row.employee)}</td><td data-label="Employer match">${money.format(row.match)}</td><td data-label="Investment earnings">${money.format(row.earnings)}</td><td data-label="Ending balance">${money.format(row.balance)}</td><td data-label="Limit status">${limitText(row)}</td></tr>`).join('')}</tbody></table>`;
}

export function bind401kForm(form) {
  if (!form) return;
  const tables = document.querySelectorAll('[data-projection-table]');
  const summary = document.querySelector('[data-projection-summary]');

  function compute({ validateAll = false, focusInvalid = false } = {}) {
    form.querySelectorAll('[aria-invalid="true"]').forEach((input) => input.setAttribute('aria-invalid', 'false'));
    const result = project(getValues(form, names));
    if (!result.ok) {
      const fields = Object.keys(result.errors);
      if (validateAll) fields.forEach((name) => showError(form.elements[name], rangeMessage(result.errors[name])));
      if (focusInvalid && fields.length) form.elements[fields[0]].focus();
      return;
    }
    form.querySelectorAll('.field').forEach((field) => field.classList.remove('is-invalid'));
    tables.forEach((table) => {
      const preview = table.dataset.projectionPreview === 'true';
      table.innerHTML = tableHtml(preview ? result.rows.slice(0, 3) : result.rows, preview);
    });
    if (summary) summary.innerHTML = `Projected balance at age ${form.elements.retirementAge.value}: <strong>${money.format(result.rows.at(-1).balance)}</strong>.`;
  }

  bindForm(form, compute);
}
