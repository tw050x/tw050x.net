import { Component } from "@kitajs/html";
import { default as EmailAddressField } from "@tw050x.net/uikit-library/component/Form/EmailAddressField";
import { default as PasswordField } from "@tw050x.net/uikit-library/component/Form/PasswordField";
import { default as Button } from "@tw050x.net/uikit-library/component/Button";
import { default as Header } from "@tw050x.net/uikit-library/component/Header";

/**
 * Props for the `<RegisterForm />` component.
 */
type Props = {
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
  const headerClassOverrides = {
    container: ['mb-12'],
  }

  return (
    <div>
      <div class="p-8">
        <Header classOverrides={headerClassOverrides} lead="Login" tier="h1">
          Enter your email address and password
        </Header>
        <div class="mb-12">
          <form>
            <div class="mb-6">
              <EmailAddressField value={email} />
            </div>
            <div class="mb-6">
              <PasswordField forceConfirmation={true} />
            </div>
            <div>
              <Button type="submit" variant="contained">
                Submit
              </Button>
            </div>
            <input type="hidden" name="nonce" value={nonce} />
          </form>
        </div>
        <div>
          <p>Need an account? <a href="/register">Register with us here</a>.</p>
        </div>
      </div>
    </div>
  );
}
export default RegisterForm;
