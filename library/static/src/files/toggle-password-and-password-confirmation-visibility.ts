function togglePasswordAndPasswordConfirmationVisibility() {
  console.debug("Toggling password visibility");

  const confirmPasswordElement = document.getElementById('password-confirmation');
  if (confirmPasswordElement === null) {
    return void console.debug("No confirm password element found");
  }

  const passwordElement = document.getElementById('password');
  if (passwordElement === null) {
    return void console.debug("No password element found");
  }

  const confirmPasswordInputElement = confirmPasswordElement.getElementsByTagName('input')[0];
  const confirmPasswordInputIconElement = confirmPasswordInputElement.nextElementSibling;
  const passwordInputElement = passwordElement.getElementsByTagName('input')[0];
  const passwordInputIconElement = passwordInputElement.nextElementSibling;

  if (confirmPasswordInputIconElement === null) {
    return void console.debug("No confirm password icon element found");
  }

  const confirmPasswordEyeClosedIconComponent = confirmPasswordInputIconElement.querySelector('#eye-closed-icon');
  if (confirmPasswordEyeClosedIconComponent === null) {
    return void console.debug("No confirm password eye closed icon component found");
  }

  const confirmPasswordEyeOpenIconComponent = confirmPasswordInputIconElement.querySelector('#eye-open-icon');
  if (confirmPasswordEyeOpenIconComponent === null) {
    return void console.debug("No confirm password eye open icon component found");
  }

  if (confirmPasswordInputElement.type === 'text') {
    confirmPasswordEyeClosedIconComponent.classList.remove('hidden');
    confirmPasswordEyeOpenIconComponent.classList.add('hidden');
  }
  else {
    confirmPasswordEyeClosedIconComponent.classList.add('hidden');
    confirmPasswordEyeOpenIconComponent.classList.remove('hidden');
  }

  confirmPasswordInputElement.type = confirmPasswordInputElement.type === 'password' ? 'text' : 'password';

  if (passwordInputIconElement === null) {
    return void console.debug("No password icon element found");
  }

  const passwordEyeClosedIconComponent = passwordInputIconElement.querySelector('#eye-closed-icon');
  if (passwordEyeClosedIconComponent === null) {
    return void console.debug("No password eye closed icon component found");
  }

  const passwordEyeOpenIconComponent = passwordInputIconElement.querySelector('#eye-open-icon');
  if (passwordEyeOpenIconComponent === null) {
    return void console.debug("No password eye open icon component found");
  }

  if (passwordInputElement.type === 'text') {
    passwordEyeClosedIconComponent.classList.remove('hidden');
    passwordEyeOpenIconComponent.classList.add('hidden');
  }
  else {
    passwordEyeClosedIconComponent.classList.add('hidden');
    passwordEyeOpenIconComponent.classList.remove('hidden');
  }
  passwordInputElement.type = passwordInputElement.type === 'password' ? 'text' : 'password';
}
