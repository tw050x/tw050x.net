import { Component } from "@kitajs/html";
import { default as Head } from "@tw050x.net.library/platform/template/component/Head";
import { default as MenuInitiator, Props as MenuInitiatorProps } from "../component/MenuInitiator.js";

/**
 * Props for the `<Account />` component.
 */
export type Props = {
  menuInitiatorProps: MenuInitiatorProps;
};

/**
 * The `<Account />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const Account: Component<Props> = (props) => {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <Head title="Account | Portal" />
        <body>
          <MenuInitiator {...props.menuInitiatorProps} />
          <main></main>
        </body>
      </html>
    </>
  );
}
export default Account;
