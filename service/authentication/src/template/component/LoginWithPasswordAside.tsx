import { Component, escapeHtml } from "@kitajs/html";
import { default as Header } from "@tw050x.net.library/uikit/component/Header";
import { default as LoginWithPasswordForm, Props as LoginWithPasswordFormProps } from "./LoginWithPasswordForm.js";

/**
 * Props for the `<LoginWithPasswordAside />` component.
 */
export type Props =
| {
  loginWithPasswordFormProps: LoginWithPasswordFormProps
}
| {
  disabled: true;
  message: string;
}

/**
 * The `<LoginWithPasswordAside />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const LoginWithPasswordAside: Component<Props> = (props) => {
  const headerClassOverrides = {
    container: ['mb-12'],
  }

  let safeLoginForm;
  loginFormGuard: {
    if (('loginWithPasswordFormProps' in props) === false) {
      break loginFormGuard;
    }
    safeLoginForm = (
      <div class="mb-12">
        <LoginWithPasswordForm {...props.loginWithPasswordFormProps} />
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
    <div class="flex flex-col flex-1 p-8">
      {safeDisabledLoginMessage ?? (
        <>
          <Header classOverrides={headerClassOverrides} lead="Login" tier="h1">
            Enter your email address and password
          </Header>
          {safeLoginForm}
          <div class="mt-auto">
            <span class="text-gray-500">
              Need an account? <a class="underline" href="/register">Register</a> with us today.
            </span>
          </div>
        </>
      )}
    </div>
  );
}
export default LoginWithPasswordAside;
