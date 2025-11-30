function togglePasswordVisibility() {
  console.debug("Toggling password visibility");

  const passwordElement = document.getElementById('password');
  if (passwordElement === null) {
    return void console.debug("No password element found");
  }
  const passwordInputElement = passwordElement.getElementsByTagName('input')[0];
  const passwordInputIconElement = passwordInputElement.nextElementSibling;

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
