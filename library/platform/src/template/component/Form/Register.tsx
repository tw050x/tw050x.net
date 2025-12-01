import { Component } from "@kitajs/html";
import { readScript } from "@tw050x.net.library/static";
import { logger } from "../../../helper/logger.js";
import { default as EmailAddressField } from "../Field/EmailAddressField.js";
import { default as PasswordField } from "../Field/PasswordField.js";
import { default as Button } from "../Button.js";
import { default as Notice } from "../Notice.js";


/**
 * Props for the `<Register />` component.
 */
export type Props = {
  email?: string;
  nonce: string;
  validationErrors?: Array<{ message: string }>;
}

/**
 * The `<Register />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const Register: Component<Props> = ({ email = '', nonce, validationErrors = [] }) => {
  let safeFormValidationErrors;
  formValidationErrorsGuard: {
    if (validationErrors.length === 0) break formValidationErrorsGuard;
    safeFormValidationErrors = (
      <div class="mt-6">
        <Notice type="error">
          {validationErrors.map((error) => error.message)}
        </Notice>
      </div>
    );
  }

  // Load the toggle-password-visibility-and-password-confirmation-visibility script
  let togglePasswordVisibilityAndPasswordConfirmationVisibilityScript
  try {
    togglePasswordVisibilityAndPasswordConfirmationVisibilityScript = readScript("toggle-password-and-password-confirmation-visibility");
  }
  catch (error) {
    logger.debug("Failed to load toggle-password-visibility-and-password-confirmation-visibility script");
    logger.error(error);
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
        {togglePasswordVisibilityAndPasswordConfirmationVisibilityScript}
      </script>
    </div>
  );
}
export default Register;
