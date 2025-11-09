import { Component } from "@kitajs/html";
import { default as Head } from "@tw050x.net.library/uikit/component/Head";
import { default as Header } from "@tw050x.net.library/uikit/component/Header";

/**
 * Props for the `<Callback />` component.
 */
type Props = {}

/**
 * The `<Callback />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const Callback: Component<Props> = ({}) => {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <Head title="Login" />
        <body>
          <main class="bg-gray-800 text-white w-screen min-h-screen">
            <Header tier="h1">
              Callback
            </Header>
          </main>
          <div class="asides"></div>
        </body>
      </html>
    </>
  );
}
export default Callback;
