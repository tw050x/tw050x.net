import { Component } from "@kitajs/html";
import { default as Header } from "@tw050x.net.library/uikit/component/Header";

/**
 * Props for the `<OAuthCallbackErrorAside />` component.
 */
export type Props =
| {
  error?: string;
  provider?: string;
}

/**
 * The `<OAuthCallbackErrorAside />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const OAuthCallbackErrorAside: Component<Props> = (props) => {
  const headerClassOverrides = {
    container: ['mb-4x'],
  }

  let headerText;

  switch (props.error) {
    case 'missing_oauth2_code':
      headerText = 'An error occured with the Provider that we have not been able to recover from.';
      break;
    case 'retry_limit_exceeded':
      headerText = 'We\'ve reached the maximum number of login attempts.';
      break;
    default:
      headerText = 'An error occured when trying to log you in.';
      break;
  }

  return (
    <div class="flex flex-col flex-1 p-8">
      <Header classOverrides={headerClassOverrides} lead="Error" tier="h1">
        {headerText}
      </Header>
      <div>
        <span class="text-gray-500">
          Go back to <a class="underline" href="/login">Login</a> to try again.
        </span>
      </div>
    </div>
  );
}
export default OAuthCallbackErrorAside;
