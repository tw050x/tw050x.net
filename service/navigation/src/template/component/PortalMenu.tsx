import { Component } from "@kitajs/html";
import { readScript } from "@tw050x.net.library/static";
import { default as Account } from "@tw050x.net.library/platform/template/svg/Account";
import { default as AccountSwitch } from "@tw050x.net.library/platform/template/svg/AccountSwitch";
import { default as ChevronLeft } from "@tw050x.net.library/platform/template/svg/ChevronLeft";
import { default as ChevronRight } from "@tw050x.net.library/platform/template/svg/ChevronRight";
import { default as Cross } from "@tw050x.net.library/platform/template/svg/Cross";
import { default as Logout } from "@tw050x.net.library/platform/template/svg/Logout";
import { default as Settings } from "@tw050x.net.library/platform/template/svg/Settings";

/**
 * Props for the `<PortalMenu />` component.
 */
export type Props = {
  menuState: 'open' | 'collapsed';
  serviceMenuItems: (
    | { label: string; href: string, IconComponent: Component, disabled?: boolean, classes?: string[] }
    | { label: string; src: string, IconComponent: Component, disabled?: boolean, classes?: string[] }
  )[];
}

/**
 * The `<PortalMenu />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const PortalMenu: Component<Props> = (props) => {

  let togglePortalMenuScript;
  try {
    togglePortalMenuScript = readScript("toggle-portal-menu");
  }
  catch (error) {
    console.debug("Failed to load toggle-portal-menu script");
    console.error(error);
  }

  return (
    <>
      <nav
        data-state={props.menuState}
        hx-boost="true"
        hx-select="main"
        hx-swap="outerHTML"
        hx-target="main"
        id="portal-menu"
      >
        <div class="flex flex-col">
          <header class="text-white font-bold px-2 py-1 flex">
            <span class="portal-menu-icon"><Cross /></span>
            <span class="portal-menu-text hidden-when-w-16 text-xs">Portal</span>
          </header>
        </div>
        <div>
          <a class="text-white cursor-pointer font-bold px-2 py-1 flex">
            <span class="portal-menu-icon"><AccountSwitch /></span>
            <span class="portal-menu-text hidden-when-w-16 text-xs">Switch Account</span>
          </a>
        </div>
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
                  "text-white hover:no-underline px-2 py-1",
                ]
                if (item.disabled) {
                  classes.push("opacity-50 cursor-not-allowed");
                }
                return (
                  <a class={classes} href={item.disabled ? undefined : item.href}>
                    <span class="portal-menu-icon"><item.IconComponent /></span>
                    <span class="hidden-when-w-16 text-xs">{item.label}</span>
                  </a>
                );
              }
              return null;
            })}
          </div>
        </div>
        <div class="flex flex-col border-b border-gray-600">
          <div class="flex flex-col divide-y divide-gray-600">
            <a
              class={[
                "text-white hover:no-underline px-2 py-1",
              ]}
              href="/portal/account"
            >
              <span class="portal-menu-icon"><Account /></span>
              <span class="hidden-when-w-16 text-xs">Account</span>
            </a>
            <a
              class={[
                "text-white hover:no-underline px-2 py-1",
              ]}
              href="/portal/settings"
            >
              <span class="portal-menu-icon"><Settings /></span>
              <span class="hidden-when-w-16 text-xs">Settings</span>
            </a>
          </div>
        </div>
        <div class="flex flex-col">
          <a class="text-white text-left cursor-pointer hover:no-underline px-2 py-1 flex-1" hx-post="/logout">
            <span class="portal-menu-icon"><Logout /></span>
            <span class="portal-menu-text hidden-when-w-16 text-xs">Logout</span>
          </a>
        </div>
        <hr class="text-gray-600" />
        <div class="flex flex-col">
          <button class="text-white text-left cursor-pointer hover:no-underline px-2 py-1 flex-1" onclick="togglePortalMenu()">
            <span class="portal-menu-icon hidden-when-data-state-collapsed"><ChevronLeft /></span>
            <span class="portal-menu-icon hidden-when-data-state-open"><ChevronRight /></span>
            <span class="portal-menu-text hidden-when-w-16 text-xs">Collapse</span>
          </button>
        </div>
      </nav>
      <script>
        {togglePortalMenuScript}
      </script>
    </>
  )
}
export default PortalMenu;
