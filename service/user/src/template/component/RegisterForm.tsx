import { Component } from "@kitajs/html";
import { default as EmailAddressField } from "@tw050x.net.library/uikit/component/Form/EmailAddressField";
import { default as PasswordField } from "@tw050x.net.library/uikit/component/Form/PasswordField";
import { default as Button } from "@tw050x.net.library/uikit/component/Button";
import { default as Notice } from "@tw050x.net.library/uikit/component/Notice";

/**
 * Props for the `<RegisterForm />` component.
 */
export type Props = {
  email?: string;
  nonce: string;
  validationErrors?: Array<{ message: string }>;
}

/**
 * The `<RegisterForm />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const RegisterForm: Component<Props> = ({ email = '', nonce, validationErrors = [] }) => {

  let safeFormValidationErrors;
  formValidationErrorsGuard: {
    if (validationErrors.length === 0) break formValidationErrorsGuard;
    safeFormValidationErrors = (
      <div class="mt-6">
        <Notice type="error">
          Invalid email address or password
        </Notice>
      </div>
    );
  }

  return (
    <>
      <form
        hx-ext="response-targets"
        hx-post="/register"
        hx-swap="outerHTML"
        hx-target="this"
        hx-target-400="this"
      >
        <div class="mb-6">
          <EmailAddressField value={email} />
        </div>
        <div class="mb-6">
          <PasswordField
            autocomplete="new-password"
            id="password"
            label="Password"
            name="password"
            onClickHandler="togglePasswordVisibility"
          />
        </div>
        <div class="mb-6">
          <PasswordField
            autocomplete="new-password"
            id="password-confirmation"
            label="Confirm Password"
            name="password-confirmation"
            onClickHandler="togglePasswordVisibility"
          />
        </div>
        <div>
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </div>
        <input type="hidden" name="nonce" value={nonce} />
      </form>
      <script>
        {`
          function togglePasswordVisibility() {
            const confirmPasswordInput = document.getElementById('password-confirmation').getElementsByTagName('input')[0];
            const confirmPasswordInputIcon = confirmPasswordInput.nextElementSibling;
            const passwordInput = document.getElementById('password').getElementsByTagName('input')[0];
            const passwordInputIcon = passwordInput.nextElementSibling;
            if (confirmPasswordInput.type === 'text') {
              confirmPasswordInputIcon.querySelector('#eye-closed-icon').classList.remove('hidden');
              confirmPasswordInputIcon.querySelector('#eye-open-icon').classList.add('hidden');
            }
            else {
              confirmPasswordInputIcon.querySelector('#eye-closed-icon').classList.add('hidden');
              confirmPasswordInputIcon.querySelector('#eye-open-icon').classList.remove('hidden');
            }
            confirmPasswordInput.type = confirmPasswordInput.type === 'password' ? 'text' : 'password';

            if (passwordInput.type === 'text') {
              passwordInputIcon.querySelector('#eye-closed-icon').classList.remove('hidden');
              passwordInputIcon.querySelector('#eye-open-icon').classList.add('hidden');
            }
            else {
              passwordInputIcon.querySelector('#eye-closed-icon').classList.add('hidden');
              passwordInputIcon.querySelector('#eye-open-icon').classList.remove('hidden');
            }
            passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
          }
        `}
      </script>
    </>
  );
}
export default RegisterForm;
