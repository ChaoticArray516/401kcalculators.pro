export const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function getValues(form, names) {
  return Object.fromEntries(names.map((name) => [name, form.elements[name].value]));
}

export function clearError(input) {
  const field = input.closest('.field');
  if (!field) return;
  field.classList.remove('is-invalid');
  input.setAttribute('aria-invalid', 'false');
  const error = field.querySelector('.error-msg');
  if (error) error.textContent = '';
  if (input.dataset.hint) input.setAttribute('aria-describedby', input.dataset.hint);
}

export function showError(input, message) {
  const field = input.closest('.field');
  if (!field) return;
  field.classList.add('is-invalid');
  input.setAttribute('aria-invalid', 'true');
  const error = field.querySelector('.error-msg');
  if (error) {
    if (!error.id) error.id = `${input.id}-error`;
    error.textContent = message;
    input.setAttribute('aria-describedby', [input.dataset.hint, error.id].filter(Boolean).join(' '));
  }
}

export function clearAllErrors(form) {
  form.querySelectorAll('input').forEach((input) => {
    clearError(input);
    const hint = input.dataset.hint;
    if (hint) input.setAttribute('aria-describedby', hint);
  });
}

export function rangeMessage(code) {
  if (!code) return 'Enter a valid number.';
  if (code === 'not-a-number') return 'Enter a valid number.';
  if (code === 'after-current-age') return 'Retirement age must be greater than your current age.';
  if (code === 'after-retirement-age') return 'Life expectancy must be greater than your retirement age.';
  if (code.startsWith('range:')) {
    const [, min, max] = code.split(':');
    return `Enter a value between ${min} and ${max}.`;
  }
  return 'Enter a valid number.';
}

export function bindForm(form, compute) {
  const names = [...form.elements].filter((el) => el.name).map((el) => el.name);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    compute({ validateAll: true, focusInvalid: true });
  });
  form.addEventListener('blur', (event) => {
    if (event.target.matches('input')) compute({ validateAll: true, changed: event.target });
  }, true);
  form.addEventListener('input', (event) => {
    if (event.target.matches('input') && event.target.checkValidity()) clearError(event.target);
  });
  form.addEventListener('reset', () => {
    setTimeout(() => {
      clearAllErrors(form);
      compute({ reset: true });
    }, 0);
  });
  return names;
}
