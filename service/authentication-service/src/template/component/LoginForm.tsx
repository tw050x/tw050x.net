import { Component } from "@kitajs/html";
import { default as EmailAddressField } from "@tw050x.net/uikit-library/component/Form/EmailAddressField";
import { default as PasswordField } from "@tw050x.net/uikit-library/component/Form/PasswordField";
import { default as Button } from "@tw050x.net/uikit-library/component/Button";
import { default as Header } from "@tw050x.net/uikit-library/component/Header";

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
      <div>
        <span class="text-xl">
          Invalid email address or password
        </span>
      </div>
    );
  }

  return (
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
        <PasswordField />
      </div>
      <div>
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </div>
      {safeFormValidationErrors}
      <input type="hidden" name="nonce" value={nonce} />
    </form>
  );
}
export default LoginForm;
