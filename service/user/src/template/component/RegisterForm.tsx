import { Component } from "@kitajs/html";
import { default as EmailAddressField } from "@tw050x.net.library/uikit/component/Form/EmailAddressField";
import { default as PasswordField } from "@tw050x.net.library/uikit/component/Form/PasswordField";
import { default as Button } from "@tw050x.net.library/uikit/component/Button";
import { default as Notice } from "@tw050x.net.library/uikit/component/Notice";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { minify_sync } from "terser";

// Read the external JavaScript file for toggling password visibility
// and minify its contents.
const togglePasswordVisibilityScript = minify_sync(readFileSync(resolve(__dirname, 'toggle-password-visibility.js'), 'utf8')).code;

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
    <div id="register-form">
      <form
        hx-ext="response-targets"
        hx-post="/register"
        hx-swap="outerHTML"
        hx-target="#register-form"
        hx-target-400="#register-form"
      >
        <div class="mb-6">
          <EmailAddressField autocomplete="off" value={email} />
        </div>
        <div class="mb-6">
          <PasswordField autocomplete="new-password" id="password" label="Password" name="password" onClickHandler="togglePasswordVisibility" />
        </div>
        <div class="mb-6">
          <PasswordField autocomplete="new-password" id="password-confirmation" label="Confirm Password" name="password-confirmation" onClickHandler="togglePasswordVisibility" />
        </div>
        <div>
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </div>
        <input type="hidden" name="nonce" value={nonce} />
      </form>
      {safeFormValidationErrors}
      <script>
        {togglePasswordVisibilityScript}
      </script>
    </div>
  );
}
export default RegisterForm;
