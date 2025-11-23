import { Component } from "@kitajs/html";
import { default as Head } from "@tw050x.net.library/uikit/component/Head";
import { default as OAuthCallbackErrorAside } from "../component/OAuthCallbackErrorAside.js";

/**
 * Props for the `<OAuthCallback />` component.
 */
type Props = {
  error?: string;
  provider?: string;
}

/**
 * The `<OAuthCallback />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const OAuthCallback: Component<Props> = (props) => {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <Head title="Login" />
        <body>
          <main class="bg-gray-800 text-white w-screen min-h-screen"></main>
          <div class="asides">
            <aside>
              <OAuthCallbackErrorAside error={props.error} provider={props.provider} />
            </aside>
          </div>
        </body>
      </html>
    </>
  );
}
export default OAuthCallback;
