import { Component } from "@kitajs/html";

/**
 * Props for the `<RefreshAuthenticationTokens />` component.
 */
export type Props = {
  delayInSeconds?: number;
  disabled?: boolean;
};

/**
 * The `<RefreshAuthenticationTokens />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const RefreshAuthenticationTokens: Component<Props> = (props) => {

  // Guard for disabled state
  disabledGuard: {
    if (('disabled' in props) === false) {
      break disabledGuard;
    }

    if (props.disabled === false) {
      break disabledGuard;
    }
    return '';
  }

  let triggerDelayInSeconds = 60;
  triggerDelayInSecondsGuard: {
    if (('delayInSeconds' in props) === false) {
      break triggerDelayInSecondsGuard;
    }
    if (typeof props.delayInSeconds !== 'number') {
      break triggerDelayInSecondsGuard;
    }
    triggerDelayInSeconds = props.delayInSeconds;
  }

  return (
    <div
      hx-post="/token/refresh/availability"
      hx-target="this"
      hx-trigger={`load delay:${triggerDelayInSeconds}s, every ${triggerDelayInSeconds}s`}
      hx-swap="outerHTML"
    />
  );
}
export default RefreshAuthenticationTokens;
