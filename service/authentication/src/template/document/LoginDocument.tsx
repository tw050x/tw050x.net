import { Component } from "@kitajs/html";
import { default as Head } from "@tw050x.net.library/uikit/component/Head";
import { default as LoginAside, Props as LoginAsideProps } from "../component/LoginAside.js";

/**
 * Props for the `<LoginDocument />` component.
 */
type Props = {
  loginAsideProps: LoginAsideProps;
}

/**
 * The `<LoginDocument />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const LoginDocument: Component<Props> = ({ loginAsideProps }) => {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <Head title="Login" />
        <body>
          <main class="bg-gray-800 text-white w-screen min-h-screen"></main>
          <div class="asides">
            <aside>
              <LoginAside {...loginAsideProps} />
            </aside>
          </div>
        </body>
      </html>
    </>
  );
}
export default LoginDocument;
