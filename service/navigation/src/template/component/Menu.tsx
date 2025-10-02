import { Component } from "@kitajs/html";
import { default as ChevronLeft } from "@tw050x.net.library/uikit/svg/ChevronLeft";
import { default as ChevronRight } from "@tw050x.net.library/uikit/svg/ChevronRight";
import { default as Portal } from "@tw050x.net.library/uikit/svg/Portal";

/**
 * Props for the `<PortalMenu />` component.
 */
export type Props = {
  menuState: 'open' | 'collapsed';
  serviceMenuItems: (
    | { label: string; href: string, IconComponent: Component, disabled?: boolean, classes?: string[] }
    | { label: string; src: string, IconComponent: Component, disabled?: boolean, classes?: string[] }
  )[];
  userMenuItems: (
    | { label: string; href: string, IconComponent: Component, disabled?: boolean }
    | { label: string; src: string, IconComponent: Component, disabled?: boolean }
  )[];
}

/**
 * The `<PortalMenu />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const PortalMenu: Component<Props> = (props) => {
  return (
    <>
      <nav data-state={props.menuState}>
        <header class="flex flex-col">
          <h1 class="text-white font-bold p-4 flex">
            <span class="portal-menu-icon"><Portal /></span>
            <span class="portal-menu-text hidden-when-w-16">Portal</span>
          </h1>
        </header>
        <hr class="text-gray-600" />
        <div class="flex flex-col flex-1 border-b border-gray-600">
          <div class="flex flex-col divide-y divide-gray-600 border-t border-b border-gray-600">
            {props.serviceMenuItems.map((item) => {
              if ('src' in item) {
                return <a>{item.label}</a>
              }
              if ('href' in item) {
                const classes = [
                  ...(item.classes ?? []),
                  "text-white hover:no-underline p-4",
                ]
                if (item.disabled) {
                  classes.push("opacity-50 cursor-not-allowed");
                }
                return (
                  <a class={classes} href={item.href}>
                    <span class="portal-menu-icon"><item.IconComponent /></span>
                    <span class="hidden-when-w-16">{item.label}</span>
                  </a>
                );
              }
              return null;
            })}
          </div>
        </div>
        <hr class="text-gray-600" />
        <div class="flex flex-col border-b border-gray-600">
          <div class="flex flex-col divide-y divide-gray-600 border-t border-b border-gray-600">
            {props.userMenuItems.map((item) => {
              const classes = [
                "text-white hover:no-underline p-4",
              ]
              if (item.disabled) {
                classes.push("opacity-50 cursor-not-allowed");
              }
              if ('src' in item) {
                return (
                  <a class={classes}>
                    <span class="portal-menu-icon"><item.IconComponent /></span>
                    <span class="hidden-when-w-16">{item.label}</span>
                  </a>
                )
              }
              if ('href' in item) {
                return (
                  <a class={classes} href={item.href}>
                    <span class="portal-menu-icon"><item.IconComponent /></span>
                    <span class="hidden-when-w-16">{item.label}</span>
                  </a>
                );
              }
              return null;
            })}
          </div>
        </div>
        <hr class="text-gray-600" />
        <div class="flex flex-col">
          <button class="text-white text-left cursor-pointer hover:no-underline p-4 flex-1" onclick="toggleMenu()">
            <span class="portal-menu-icon hidden-when-data-state-collapsed"><ChevronLeft /></span>
            <span class="portal-menu-icon hidden-when-data-state-open"><ChevronRight /></span>
            <span class="portal-menu-text hidden-when-w-16">Collapse</span>
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
            document.cookie = "ui.menu.state=" + (isCollapsed ? 'open' : 'collapsed') + "; path=/; SameSite=Lax";
          }
        `}
      </script>
    </>
  )
}
export default PortalMenu;
