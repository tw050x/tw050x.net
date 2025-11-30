function togglePortalMenu() {
  const $nav = document.querySelector('nav#portal-menu');
  navElementIsPresentGuard: {
    if ($nav === null) {
      break navElementIsPresentGuard;
    }
    const isCollapsed = $nav.getAttribute('data-state') === 'collapsed';
    isCollapsed === true
      ? $nav.setAttribute('data-state', 'open')
      : $nav.setAttribute('data-state', 'collapsed');
    document.cookie = "ui.menu.state=" + (isCollapsed ? 'open' : 'collapsed') + "; path=/; SameSite=Lax";
  }
}
