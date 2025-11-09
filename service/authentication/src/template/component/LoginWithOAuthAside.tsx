import { Component, escapeHtml } from "@kitajs/html";
import { default as ContinueWithGoogleButton } from "@tw050x.net.library/uikit/component/Button/ContinueWithGoogleButton";
import { default as LoginWithPasswordButton } from "@tw050x.net.library/uikit/component/Button/LoginWithPasswordButton";
import { default as Header } from "@tw050x.net.library/uikit/component/Header";

/**
 * Props for the `<LoginWithOAuthAside />` component.
 */
export type Props =
| {
  oauthProviders: {
    google?: { enabled: boolean; };
  }
}
| {
  disabled: true;
  message: string;
}

/**
 * The `<LoginWithOAuthAside />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const LoginWithOAuthAside: Component<Props> = (props) => {
  const headerClassOverrides = {
    container: ['mb-12'],
  }

  let safeOAuthButtonForm;
  loginWithOAuthButtonGuard: {
    if (('oauthProviders' in props) === false) {
      break loginWithOAuthButtonGuard;
    }
    safeOAuthButtonForm = (
      <div class="flex flex-col space-y-2 mb-12">
        <div
          class="flex flex-col"
          hx-get="/oauth2/google"
        >
          <ContinueWithGoogleButton />
        </div>
        <span class="font-bold text-center text-italic text-gray-400">
          — or —
        </span>
        <div
          class="flex flex-col"
          hx-get="/login/aside/login-with-password-aside"
          hx-target=".asides"
          hx-swap="innerHTML"
        >
          <LoginWithPasswordButton />
        </div>
      </div>
    );
  }

  let safeDisabledLoginMessage;
  disabledLoginMessageGuard: {
    if (('disabled' in props) === false) {
      break disabledLoginMessageGuard;
    }
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
            Login with your preferred Auth Provider
          </Header>
          {safeOAuthButtonForm}
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
export default LoginWithOAuthAside;
