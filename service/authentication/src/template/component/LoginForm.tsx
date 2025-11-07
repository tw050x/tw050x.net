import { Component } from "@kitajs/html";
import { logger } from "@tw050x.net.library/logger";
import { default as readScript } from "@tw050x.net.library/uikit/read-script";
import { default as EmailAddressField } from "@tw050x.net.library/uikit/component/Form/EmailAddressField";
import { default as PasswordField } from "@tw050x.net.library/uikit/component/Form/PasswordField";
import { default as Button } from "@tw050x.net.library/uikit/component/Button";
import { default as Notice } from "@tw050x.net.library/uikit/component/Notice";

/**
 * Props for the `<LoginForm />` component.
 */
export type Props = {
  email?: string;
  nonce: string;
  validationErrors?: Array<{ message: string }>;
}

/**
 * The `<LoginForm />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const LoginForm: Component<Props> = ({ email = '', nonce, validationErrors = [] }) => {
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
        <div>
          <Button type="submit" variant="contained">
            Submit
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
export default LoginForm;
