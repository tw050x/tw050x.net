import { Component } from "@kitajs/html";
import { default as Htmx } from "@tw050x.net.library/uikit/component/Htmx";
import { default as Stylesheet } from "@tw050x.net.library/uikit/component/Stylesheet";
import { default as MenuInitiator } from "../component/MenuInitiator";

/**
 * Props for the `<Products />` component.
 */
type Props = {};

/**
 * The `<Products />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const Products: Component<Props> = () => {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <base href="/" />
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Products | Portal</title>

          <Htmx />
          <Stylesheet />
        </head>
        <body>
          <MenuInitiator />
          <main></main>
        </body>
      </html>
    </>
  );
}
export default Products;
