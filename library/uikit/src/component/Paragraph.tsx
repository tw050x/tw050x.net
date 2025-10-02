import { Component } from "@kitajs/html";

/**
 * Props for the `<Paragraph />` component.
 */
export type Props = {}

/**
 * The `<Paragraph />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const Paragraph: Component<Props> = ({ children }) => {
  return (
    <p data-component="paragraph">
      {children}
    </p>
  );
}
export default Paragraph;
