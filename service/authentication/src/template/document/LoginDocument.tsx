import { Component } from "@kitajs/html";
import { default as Htmx } from "@tw050x.net/uikit/component/Htmx";
import { default as Stylesheet } from "@tw050x.net/uikit/component/Stylesheet";

/**
 * Props for the login document.
 */
type Props = {}

/**
 * The login document.
 *
 */
const LoginDocument: Component<Props> = ({  }) => {
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
          <main class="bg-sky-950 text-white w-screen h-screen"></main>
          <div class="asides">
            <div
              hx-get="/login/aside/login-form"
              hx-swap="outerHTML settle:.1s"
              hx-trigger="load"
            />
          </div>
        </body>
      </html>
    </>
  );
}
export default LoginDocument;
