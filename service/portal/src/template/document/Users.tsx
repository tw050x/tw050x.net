import { Component } from "@kitajs/html";
import { default as AnchoredBar } from "@tw050x.net.library/platform/template/component/AnchoredBar";
import { default as Header } from "@tw050x.net.library/platform/template/component/Header";
import { default as Head } from "@tw050x.net.library/platform/template/component/Head";
import { default as MenuInitiator, Props as MenuInitiatorProps } from "../component/MenuInitiator.js";
import { default as UserTable, Props as UserTableProps } from "../component/UserTable.js";
import { default as UserTableTools, Props as UserTableToolsProps } from "../component/UserTableTools.js";

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
        <Head title="Users | Portal" />
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
