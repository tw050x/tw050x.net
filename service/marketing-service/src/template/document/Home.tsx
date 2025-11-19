import { Component } from "@kitajs/html";
import { default as RefreshAuthenticationTokens } from "@tw050x.net.library/authentication/component/RefreshAuthenticationTokens";
import { default as Head } from "@tw050x.net.library/uikit/component/Head";

/**
 * Props for the `<HomeDocument />` component.
 */
type Props = {};

/**
 * The `<HomeDocument />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const HomeDocument: Component<Props> = () => {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <Head title="Home" />
        <body>
          <RefreshAuthenticationTokens />
          <div class="flex flex-col px-8 pt-8">
            <h1 class="text-4xl">Home</h1>
          </div>
        </body>
      </html>
    </>
  );
}
export default HomeDocument;
