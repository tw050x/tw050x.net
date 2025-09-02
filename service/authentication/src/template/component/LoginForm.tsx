import { Component } from "@kitajs/html";
import { default as Button } from "@tw050x.net/uikit/component/Button";
import { default as Header } from "@tw050x.net/uikit/component/Header";
import LoginFormEmailAddressField from "./LoginFormEmailAddressField";
import LoginFormPasswordField from "./LoginFormPasswordField";

/**
 * Props for the `<LoginForm />` component.
 */
type Props = {
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
              <LoginFormEmailAddressField value={email} />
            </div>
            <div class="mb-6">
              <LoginFormPasswordField />
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
export default LoginForm;
