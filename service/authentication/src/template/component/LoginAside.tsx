import { Component, escapeHtml } from "@kitajs/html";
import { default as Header } from "@tw050x.net.library/uikit/component/Header";
import { default as LoginForm, Props as LoginFormProps } from "./LoginForm.js";

/**
 * Props for the `<LoginAside />` component.
 */
export type Props =
| {
  loginFormProps: LoginFormProps
}
| {
  disabled: true;
  message: string;
}

/**
 * The `<LoginAside />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const LoginAside: Component<Props> = (props) => {
  const headerClassOverrides = {
    container: ['mb-12'],
  }

  let safeLoginForm;
  loginFormGuard: {
    if (('loginFormProps' in props) === false) break loginFormGuard;
    safeLoginForm = (
      <div class="mb-12">
        <LoginForm {...props.loginFormProps} />
      </div>
    );
  }

  let safeDisabledLoginMessage;
  disabledLoginMessageGuard: {
    if (('disabled' in props) === false) break disabledLoginMessageGuard;
    safeDisabledLoginMessage = (
      <Header classOverrides={headerClassOverrides} lead="Login" tier="h1">
        {escapeHtml(props.message)}
      </Header>
    )
  }

  return (
    <div>
      <div class="p-8">
        {safeDisabledLoginMessage ?? (
          <>
            <Header classOverrides={headerClassOverrides} lead="Login" tier="h1">
              Enter your email address and password
            </Header>
            {safeLoginForm}
            <div>
              <span class="text-gray-500">
                Need an account? <a class="underline" href="/register">Register</a> with us today.
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export default LoginAside;
