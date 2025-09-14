import { Component } from "@kitajs/html";
import { default as ChevronLeft } from "@tw050x.net.library/uikit/svg/ChevronLeft";
import { default as ChevronRight } from "@tw050x.net.library/uikit/svg/ChevronRight";

/**
 * Props for the `<Menu />` component.
 */
export type Props = {
  items:
    | { label: string; href: string, IconComponent: Component }[]
    | { label: string; src: string, IconComponent: Component }[];
  state: 'open' | 'collapsed';
}

/**
 * The `<Menu />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const Menu: Component<Props> = (props) => {
  return (
    <>
      <nav data-state={props.state}>
        <header>
          <h1 class="text-white text-2xl font-bold p-4">
            <span class="hidden-when-w-16">Admin</span>
          </h1>
        </header>
        <hr class="text-gray-600" />
        <div class="flex flex-col flex-1 border-b border-gray-600">
          <div class="flex flex-col divide-y divide-gray-600 border-t border-b border-gray-600">
            {props.items.map((item) => {
              if ('src' in item) {
                return (
                  <a>{item.label}</a>
                )
              }

              if ('href' in item) {
                return (
                  <a class="text-white hover:no-underline p-4" href={item.href}>
                    <span class="menu-icon"><item.IconComponent /></span>
                    <span class="hidden-when-w-16">{item.label}</span>
                  </a>
                );
              }

              return null;
            })}
          </div>
        </div>
        <hr class="text-gray-600" />
        <div class="flex">
          <button class="text-white text-left cursor-pointer hover:no-underline p-4 flex-1" onclick="toggleMenu()">
            <span class="menu-icon hidden-when-data-state-collapsed"><ChevronLeft /></span>
            <span class="menu-icon hidden-when-data-state-open"><ChevronRight /></span>
            <span class="menu-text hidden-when-w-16">Collapse</span>
          </button>
        </div>
      </nav>
      <script>
        {`
          function toggleMenu() {
            const $nav = document.querySelector('nav');
            const isCollapsed = $nav.getAttribute('data-state') === 'collapsed';
            if (isCollapsed) $nav.setAttribute('data-state', 'open');
            else $nav.setAttribute('data-state', 'collapsed');
            document.cookie = "ui.menu.state=" + (isCollapsed ? 'open' : 'collapsed') + "; path=/navigation/; SameSite=Lax";
          }
        `}
      </script>
    </>
  )
}
export default Menu;
