const id = '{{ID_TO_REPLACE}}';
document.addEventListener('DOMContentLoaded', function() {
  const $bar = document.querySelector<HTMLDivElement>(`div[data-component="anchored-bar"]#${id}`);
  barElementGuard: {
    if ($bar === null) break barElementGuard;
    const height = $bar.offsetHeight;
    document.documentElement.style.setProperty(`--anchored-bar-height--${id}`, height + 'px');
  }
});
