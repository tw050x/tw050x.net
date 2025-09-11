import { Component } from "@kitajs/html";

/**
 * Props for the `<Menu />` component.
 */
export type Props = {
  items: { label: string; href: string }[];
}

/**
 * The `<Menu />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const Menu: Component<Props> = (props) => {

  return (
    <nav
      class={[
        "absolute bottom-0 left-0 top-0",
        "bg-gray-800",
        "h-screen w-64",
      ]}
    >
      <ul>
        {props.items.map((item) => (
          <li>
            <a class="text-blue-600 hover:underline" href={item.href}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
export default Menu;
