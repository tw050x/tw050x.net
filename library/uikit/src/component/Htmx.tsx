import { Component } from "@kitajs/html";

/**
 *
 */
const Htmx: Component = () => {
  return (
    <>
      <script defer src="/assets/htmx.min.js" />
      <script defer src="/assets/htmx-ext/response-targets.min.js" />
    </>
  );
}
export default Htmx
