import { Component } from "@kitajs/html";
import { readScript } from "@tw050x.net.library/static";
import { logger } from "../../../helper/logger.js";
import { default as EmailAddressField } from "../Field/EmailAddressField.js";
import { default as PasswordField } from "../Field/PasswordField.js";
import { default as Button } from "../Button.js";
import { default as Notice } from "../Notice.js";

/**
 * Props for the `<LoginWithPassword />` component.
 */
export type Props = {
  email?: string;
  nonce: string;
  validationErrors?: Array<{ message: string }>;
}

/**
 * The `<LoginWithPassword />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const LoginWithPassword: Component<Props> = ({ email = '', nonce, validationErrors = [] }) => {
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

  // Load the toggle-password-visibility script
  let togglePasswordVisibilityScript
  try {
    togglePasswordVisibilityScript = readScript("toggle-password-visibility");
  }
  catch (error) {
    logger.debug("Failed to load toggle-password-visibility script");
    logger.error(error);
  }

  return (
    <>
      <form
        hx-ext="response-targets"
        hx-post="/login"
        hx-swap="outerHTML"
        hx-target="this"
        hx-target-400="this"
      >
        <div class="mb-6">
          <EmailAddressField value={email} />
        </div>
        <div class="mb-6">
          <PasswordField
            autocomplete="current-password"
            id="password"
            label="Password"
            name="password"
            onClickHandler="togglePasswordVisibility"
          />
        </div>
        <div class="flex flex-row space-x-2">
          <Button type="submit" variant="contained">
            Submit
          </Button>
          <Button
            attributes={{
              'hx-get': '/login/aside/login-with-oauth-aside',
              'hx-target': '.asides',
              'hx-swap': 'innerHTML'
            }}
            variant="outlined"
          >
            Cancel
          </Button>
        </div>
        {safeFormValidationErrors}
        <input type="hidden" name="nonce" value={nonce} />
      </form>
      <script>
        {togglePasswordVisibilityScript}
      </script>
    </>
  );
}
export default LoginWithPassword;
