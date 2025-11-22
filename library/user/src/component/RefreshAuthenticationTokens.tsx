import { Component } from "@kitajs/html";

/**
 * Props for the `<RefreshAuthenticationTokens />` component.
 */
type Props = {};

/**
 * The `<RefreshAuthenticationTokens />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const RefreshAuthenticationTokens: Component<Props> = () => {
  return (
    <div
      hx-post="/token/refresh/availability"
      hx-trigger="load delay:5s, every 15s"
    />
  );
}
export default RefreshAuthenticationTokens;
