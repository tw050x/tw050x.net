import { Component } from "@kitajs/html";
import { default as Head } from "../component/Head.js";
import { default as LoginAside, Props as LoginAsideProps } from "../component/LoginWithPasswordAside.js";

/**
 * Props for the `<LoginWithPassword />` component.
 */
type Props = {
  loginWithPasswordAsideProps: LoginAsideProps;
}

/**
 * The `<LoginWithPassword />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const LoginWithPassword: Component<Props> = ({ loginWithPasswordAsideProps }) => {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <Head title="Login" />
        <body>
          <main class="bg-gray-800 text-white w-screen min-h-screen"></main>
          <div class="asides">
            <aside>
              <LoginAside {...loginWithPasswordAsideProps} />
            </aside>
          </div>
        </body>
      </html>
    </>
  );
}
export default LoginWithPassword;
