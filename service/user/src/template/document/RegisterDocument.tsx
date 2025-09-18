import { Component } from "@kitajs/html";
import { default as Htmx } from "@tw050x.net.library/uikit/component/Htmx";
import { default as Stylesheet } from "@tw050x.net.library/uikit/component/Stylesheet";
import { default as RegisterAside, Props as RegisterAsideProps } from "../component/RegisterAside";

/**
 * Props for the `<RegisterDocument />` component.
 */
type Props = {
  registerAsideProps: RegisterAsideProps;
}

/**
 * The `<RegisterDocument />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const RegisterDocument: Component<Props> = ({ registerAsideProps }) => {
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
          <main class="bg-gray-800 text-white w-screen min-h-screen"></main>
          <div class="asides">
            <aside>
              <RegisterAside {...registerAsideProps} />
            </aside>
          </div>
        </body>
      </html>
    </>
  );
}
export default RegisterDocument;
