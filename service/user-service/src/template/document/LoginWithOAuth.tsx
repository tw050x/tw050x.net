import { Component } from "@kitajs/html";
import { default as Head } from "@tw050x.net.library/uikit/component/Head";
import { default as LoginWithOAuthAside, Props as LoginWithOAuthAsideProps } from "../component/LoginWithOAuthAside.js";

/**
 * Props for the `<LoginWithOAuth />` component.
 */
type Props = {
  loginWithOAuthAsideProps: LoginWithOAuthAsideProps;
}

/**
 * The `<LoginWithOAuth />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const LoginWithOAuth: Component<Props> = ({ loginWithOAuthAsideProps }) => {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <Head title="Login" />
        <body>
          <main class="bg-gray-800 text-white w-screen min-h-screen"></main>
          <div class="asides">
            <aside>
              <LoginWithOAuthAside {...loginWithOAuthAsideProps} />
            </aside>
          </div>
        </body>
      </html>
    </>
  );
}
export default LoginWithOAuth;
