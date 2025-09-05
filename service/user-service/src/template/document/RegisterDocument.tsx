import { Component } from "@kitajs/html";
import { default as Htmx } from "@tw050x.net/uikit-library/component/Htmx";
import { default as Stylesheet } from "@tw050x.net/uikit-library/component/Stylesheet";

/**
 * Props for the `<RegisterDocument />` component.
 */
type Props = {}

/**
 * The `<RegisterDocument />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const RegisterDocument: Component<Props> = () => {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <base href="/" />
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Register</title>

          <Htmx />
          <Stylesheet />
        </head>
        <body>
          <main class="bg-sky-950 text-white w-screen min-h-screen"></main>
          <div class="asides">
            <div
              hx-get="/register/aside/register-form"
              hx-swap="outerHTML settle:.1s"
              hx-trigger="load"
            />
          </div>
        </body>
      </html>
    </>
  );
}
export default RegisterDocument;
