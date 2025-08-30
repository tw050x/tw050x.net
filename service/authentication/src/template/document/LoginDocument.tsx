import { Component } from "@kitajs/html";
import { default as Htmx } from "@tw050x.net/uikit/component/Htmx";
import { default as Stylesheet } from "@tw050x.net/uikit/component/Stylesheet";

/**
 * Props for the login document.
 */
type Props = {
  nonce: string;
}

/**
 * The login document.
 *
 */
const LoginDocument: Component<Props> = ({ nonce }) => {
  console.log('nonce', nonce);
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
          <div class="flex flex-col px-8 pt-8">
            <h1 class="text-4xl">Login</h1>
          </div>
        </body>
      </html>
    </>
  );
}
export default LoginDocument;
