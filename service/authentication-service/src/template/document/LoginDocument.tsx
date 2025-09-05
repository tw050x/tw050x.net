import { Component } from "@kitajs/html";
import { default as Htmx } from "@tw050x.net/uikit-library/component/Htmx";
import { default as Stylesheet } from "@tw050x.net/uikit-library/component/Stylesheet";
import { default as LoginAside } from "../component/LoginAside";
import { Props as LoginFormProps } from "../component/LoginForm";

/**
 * Props for the `<LoginDocument />` component.
 */
type Props = {
  loginAsideProps: {
    loginFormProps: LoginFormProps;
  };
}

/**
 * The `<LoginDocument />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const LoginDocument: Component<Props> = ({ loginAsideProps}) => {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <base href="/" />
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Login</title>

          <Htmx />
          <Stylesheet />
        </head>
        <body>
          <main class="bg-sky-950 text-white w-screen min-h-screen"></main>
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
