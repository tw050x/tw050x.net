import { Component } from "@kitajs/html";
import { default as Head } from "@tw050x.net.library/uikit/component/Head";
import { default as MenuInitiator, Props as MenuInitiatorProps } from "../component/MenuInitiator.js";

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
        <Head title="Dashboard | Portal" />
        <body>
          <MenuInitiator {...props.menuInitiatorProps} />
          <main></main>
        </body>
      </html>
    </>
  );
}
export default Dashboard;
