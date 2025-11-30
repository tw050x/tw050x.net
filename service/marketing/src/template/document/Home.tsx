import { Component } from "@kitajs/html";
import { default as Head } from "@tw050x.net.library/uikit/component/Head";

/**
 * Props for the `<Home />` component.
 */
type Props = {};

/**
 * The `<Home />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const Home: Component<Props> = (props) => {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <Head title="Home" />
        <body>
          <div class="flex flex-col px-8 pt-8">
            <h1 class="text-4xl">Home</h1>
          </div>
        </body>
      </html>
    </>
  );
}
export default Home;
