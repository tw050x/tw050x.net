import { Component } from "@kitajs/html";

/**
 * Props for the `<FooterRow />` component.
 */
export type Props = {}

/**
 * The `<FooterRow />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const FooterRow: Component<Props> = () => {
  return (
    <tr data-component="footer-row"></tr>
  )
}
export default FooterRow;
