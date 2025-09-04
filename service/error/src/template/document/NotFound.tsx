import { Component } from "@kitajs/html";
import { default as Htmx } from "@tw050x.net/uikit/component/Htmx";
import { default as Stylesheet } from "@tw050x.net/uikit/component/Stylesheet";

/**
 * Props for the `<NotFoundDocument />` component.
 */
type Props = {}

/**
 * The `<NotFoundDocument />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const NotFoundDocument: Component<Props> = () => {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <base href="/" />
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Not Found</title>

          <Htmx />
          <Stylesheet />
        </head>
        <body>
          <main class="bg-sky-950 text-white w-screen min-h-screen">
            Not Found
          </main>
          <div class="asides"></div>
        </body>
      </html>
    </>
  );
}
export default NotFoundDocument;
