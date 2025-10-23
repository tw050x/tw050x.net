function togglePasswordVisibility() {

  const confirmPasswordComponent = document.getElementById('password-confirmation');
  if (confirmPasswordComponent === null) {
    // TODO: log error
    return;
  }

  const passwordComponent = document.getElementById('password');
  if (passwordComponent === null) {
    // TODO: log error
    return;
  }

  const confirmPasswordInput = confirmPasswordComponent.getElementsByTagName('input')[0];
  const confirmPasswordInputIcon = confirmPasswordInput.nextElementSibling;
  const passwordInput = passwordComponent.getElementsByTagName('input')[0];
  const passwordInputIcon = passwordInput.nextElementSibling;

  if (confirmPasswordInputIcon === null) {
    // TODO: log error
    return;
  }

  const confirmPasswordEyeClosedIconComponent = confirmPasswordInputIcon.querySelector('#eye-closed-icon');
  if (confirmPasswordEyeClosedIconComponent === null) {
    // TODO: log error
    return;
  }

  const confirmPasswordEyeOpenIconComponent = confirmPasswordInputIcon.querySelector('#eye-open-icon');
  if (confirmPasswordEyeOpenIconComponent === null) {
    // TODO: log error
    return;
  }

  if (confirmPasswordInput.type === 'text') {
    confirmPasswordEyeClosedIconComponent.classList.remove('hidden');
    confirmPasswordEyeOpenIconComponent.classList.add('hidden');
  }
  else {
    confirmPasswordEyeClosedIconComponent.classList.add('hidden');
    confirmPasswordEyeOpenIconComponent.classList.remove('hidden');
  }

  confirmPasswordInput.type = confirmPasswordInput.type === 'password' ? 'text' : 'password';

  if (passwordInputIcon === null) {
    // TODO: log error
    return;
  }

  const passwordEyeClosedIconComponent = passwordInputIcon.querySelector('#eye-closed-icon');
  if (passwordEyeClosedIconComponent === null) {
    // TODO: log error
    return;
  }

  const passwordEyeOpenIconComponent = passwordInputIcon.querySelector('#eye-open-icon');
  if (passwordEyeOpenIconComponent === null) {
    // TODO: log error
    return;
  }

  if (passwordInput.type === 'text') {
    passwordEyeClosedIconComponent.classList.remove('hidden');
    passwordEyeOpenIconComponent.classList.add('hidden');
  }
  else {
    passwordEyeClosedIconComponent.classList.add('hidden');
    passwordEyeOpenIconComponent.classList.remove('hidden');
  }
  passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
}
