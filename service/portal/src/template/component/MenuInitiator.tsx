import { Component } from "@kitajs/html";

/**
 * Props for the `<Menu />` component.
 */
export type Props = {

}

/**
 * The `<MenuInitiator />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const MenuInitiator: Component<Props> = () => {
  return (
    <nav
      hx-get="/navigation/portal"
      hx-swap="outerHTML"
      hx-target="this"
      hx-trigger="load"
    />
  )
}
export default MenuInitiator;
