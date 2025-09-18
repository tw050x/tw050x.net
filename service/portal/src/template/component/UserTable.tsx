import { Component } from "@kitajs/html";

/**
 * Props for the `<UserTable />` component.
 */
export type Props = {}

/**
 * The `<UserTable />` component.
 *
 * @returns {JSX.Element}
 */
const UserTable: Component<Props> = () => {
  return (
    <div
      class={[
        "p-4 m-2 mt-4 border border-gray-200 rounded-lg shadow-sm",
        "hover:shadow-md transition-shadow duration-200",
        "hover:outline hover:outline-blue-500",
        "cursor-pointer"
      ]}
      data-component="user-table-tools"
    >
      <span></span>
    </div>
  )
}
export default UserTable;
