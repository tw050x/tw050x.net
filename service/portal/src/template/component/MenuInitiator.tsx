import { Component } from "@kitajs/html";

/**
 * Props for the `<Menu />` component.
 */
export type Props = {
  state: 'collapsed' | 'open';
}

/**
 * The `<MenuInitiator />` component.
 *
 * @prop state - The initial state of the menu, either 'collapsed' or 'open'.
 * @returns {JSX.Element}
 */
const MenuInitiator: Component<Props> = (props) => {
  return (
    <nav
      data-state={props.state}
      hx-get="/navigation/portal"
      hx-swap="outerHTML"
      hx-target="this"
      hx-trigger="load"
    />
  )
}
export default MenuInitiator;
