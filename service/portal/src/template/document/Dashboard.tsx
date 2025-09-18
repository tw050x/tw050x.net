import { Component } from "@kitajs/html";
import { default as Htmx } from "@tw050x.net.library/uikit/component/Htmx";
import { default as Stylesheet } from "@tw050x.net.library/uikit/component/Stylesheet";
import { default as MenuInitiator, Props as MenuInitiatorProps } from "../component/MenuInitiator";

/**
 * Props for the `<Dashboard />` component.
 */
export type Props = {
  menuInitiatorProps: MenuInitiatorProps;
};

/**
 * The `<Dashboard />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const Dashboard: Component<Props> = (props) => {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <base href="/" />
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Dashboard | Portal</title>

          <Htmx />
          <Stylesheet />
        </head>
        <body>
          <MenuInitiator {...props.menuInitiatorProps} />
          <main></main>
        </body>
      </html>
    </>
  );
}
export default Dashboard;
