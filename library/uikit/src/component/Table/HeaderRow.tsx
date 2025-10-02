import { Component } from "@kitajs/html";

/**
 * Props for the `<HeaderRow />` component.
 */
export type Props = {}

/**
 * The `<HeaderRow />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const HeaderRow: Component<Props> = () => {
  return (
    <th data-component="header-row"></th>
  )
}
export default HeaderRow;
