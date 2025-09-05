import { Component } from "@kitajs/html";
import { default as Header } from "@tw050x.net/uikit-library/component/Header";
import { default as LoginForm, Props as LoginFormProps } from "./LoginForm";

/**
 * Props for the `<LoginAside />` component.
 */
type Props = {
  loginFormProps: LoginFormProps
}

/**
 * The `<LoginAside />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const LoginAside: Component<Props> = ({ loginFormProps }) => {
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
          <LoginForm {...loginFormProps} />
        </div>
        <div>
          <p class="text-gray-500">Need an account? <a class="underline" href="/register">Register</a> with us today.</p>
        </div>
      </div>
    </div>
  );
}
export default LoginAside;
