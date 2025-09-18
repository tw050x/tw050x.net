import { Component } from "@kitajs/html";
import { default as AnchoredBar } from "@tw050x.net.library/uikit/component/AnchoredBar";
import { default as Header } from "@tw050x.net.library/uikit/component/Header";
import { default as Htmx } from "@tw050x.net.library/uikit/component/Htmx";
import { default as Stylesheet } from "@tw050x.net.library/uikit/component/Stylesheet";
import { default as MenuInitiator, Props as MenuInitiatorProps } from "../component/MenuInitiator";
import { default as UserTable, Props as UserTableProps } from "../component/UserTable";
import { default as UserTableTools, Props as UserTableToolsProps } from "../component/UserTableTools";

/**
 * Props for the `<Users />` component.
 */
export type Props = {
  menuInitiatorProps: MenuInitiatorProps;
  userTableProps: UserTableProps;
  userTableToolsProps: UserTableToolsProps;
};

/**
 * The `<Users />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const Users: Component<Props> = (props) => {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <base href="/" />
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Users | Portal</title>
          <Htmx />
          <Stylesheet />
        </head>
        <body>
          <MenuInitiator {...props.menuInitiatorProps} />
          <main>
            <AnchoredBar id="page-header" position="top">
              <Header tier="h1">Users</Header>
            </AnchoredBar>
            <UserTableTools {...props.userTableToolsProps} />
            <UserTable {...props.userTableProps} />
          </main>
        </body>
      </html>
    </>
  );
}
export default Users;
