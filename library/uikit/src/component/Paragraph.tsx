import { Component } from "@kitajs/html";

type Props = {
  classOverrides?: {
    container?: string | Array<string>;
  };
}

/**
 * The `<Paragraph />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const Paragraph: Component<Props> = ({ children, classOverrides }) => {
  return (
    <p class={[...(classOverrides?.container ?? [])]} data-component="paragraph">
      {children}
    </p>
  );
}
export default Paragraph;
