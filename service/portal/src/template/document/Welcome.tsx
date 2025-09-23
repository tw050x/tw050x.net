import { Component } from "@kitajs/html";
import { default as AnchoredBar } from "@tw050x.net.library/uikit/component/AnchoredBar";
import { default as Header } from "@tw050x.net.library/uikit/component/Header";
import { default as Htmx } from "@tw050x.net.library/uikit/component/Htmx";
import { default as Stylesheet } from "@tw050x.net.library/uikit/component/Stylesheet";
import { assertUnreachable } from "@tw050x.net.library/utility/assert-unreachable";
import { default as MenuInitiator, Props as MenuInitiatorProps } from "../component/MenuInitiator";
import { default as WelcomeOwner } from "../component/WelcomeOwner";
import { default as WelcomeMember } from "../component/WelcomeMember";

/**
 * Props for the `<Welcome />` component.
 */
export type Props = {
  menuInitiatorProps: MenuInitiatorProps;
  welcomeComponent: 'WelcomeOwner' | 'WelcomeMember';
};

/**
 * The `<Welcome />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const Welcome: Component<Props> = (props) => {

  // Determine which welcome component to render
  let WelcomeComponent
  switch (props.welcomeComponent) {
    case 'WelcomeOwner':
      WelcomeComponent = <WelcomeOwner />;
      break;
    case 'WelcomeMember':
      WelcomeComponent = <WelcomeMember />;
      break;
    default:
      assertUnreachable(props.welcomeComponent);
  }

  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <base href="/" />
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Welcome | Portal</title>
          <Htmx />
          <Stylesheet />
        </head>
        <body>
          <MenuInitiator {...props.menuInitiatorProps} />
          <main>
            <AnchoredBar id="page-header" position="top">
              <Header tier="h1">Welcome to the Portal</Header>
            </AnchoredBar>
            {WelcomeComponent}
          </main>
        </body>
      </html>
    </>
  );
}
export default Welcome;
