import { Component } from "@kitajs/html";
import { default as ChevronDown } from "@tw050x.net.library/uikit/svg/ChevronDown";
import { default as Cross } from "@tw050x.net.library/uikit/svg/Cross";

/**
 * Props for the `<UserTableTools />` component.
 */
export type Props = {
  state: "collapsed" | "open";
}

/**
 * The `<UserTableTools />` component.
 *
 * @returns
 */
const UserTableTools: Component<Props> = (props) => {
  let containerHTMXAttributes = {};
  if (props.state === 'collapsed') {
    containerHTMXAttributes = {
      'hx-get': '/portal/users/partial/user-table-tools',
      'hx-target': 'this',
      'hx-swap': 'outerHTML',
    }
  }

  let crossIconHTMXAttributes = {};
  if (props.state === 'open') {
    crossIconHTMXAttributes = {
      'hx-get': '/portal/users/partial/user-table-tools',
      'hx-target': 'div[data-component="user-table-tools"]',
      'hx-swap': 'outerHTML',
    }
  }

  return (
    <>
      <div
        class={[
          "border border-gray-200 rounded-lg shadow-sm",
          "p-4 m-2 mt-4",
          "hover:shadow-md transition-shadow duration-200",
          "hover:outline hover:outline-blue-500",
          props.state === 'collapsed' ? "cursor-pointer" : "",
        ]}
        data-component="user-table-tools"
        {...containerHTMXAttributes}
      >
        <div class="flex flex-row">
          <div class="flex flex-1">
            hello world
          </div>
          <div>
            {props.state === 'collapsed' && <span class="w-6 h-6 ml-0.5 mr-2 inline-block align-middle"><ChevronDown /></span>}
            {props.state === 'open' && <span class="w-6 h-6 ml-0.5 mr-2 inline-block align-middle cursor-pointer" {...crossIconHTMXAttributes}><Cross /></span>}
          </div>
        </div>
      </div>
    </>
  )
}
export default UserTableTools;
