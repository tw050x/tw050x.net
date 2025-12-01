import { Component } from "@kitajs/html";

/**
 * Props for the `<Head />` component.
 */
type Props = {
  baseHref?: string;
  title?: string;
}

/**
 * The `<Head />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const Head: Component<Props> = (props) => {

  let baseHrefElement = <base href="/" />;
  baseHrefElementGuard: {
    if (props.baseHref === undefined) break baseHrefElementGuard;
    baseHrefElement = <base href={props.baseHref} />;
  }

  let titleElement;
  titleElementGuard: {
    if (props.title === undefined) break titleElementGuard;
    titleElement = <title>{props.title}</title>;
  }

  return (
    <>
      {baseHrefElement}
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {titleElement}
      <script defer src="/assets/htmx.min.js" />
      <script defer src="/assets/htmx-ext/response-targets.min.js" />
      <link rel="stylesheet" href="/assets/stylesheet.css" />
    </>
  );
}
export default Head;
