import { Component } from "@kitajs/html";

/**
 * Props for the `<Table />` component.
 */
export type Props = {}

/**
 * The `<Table />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const Table: Component<Props> = (props) => {
  return (
    <>
      <div class="grid" data-component="table">
        {props.children}
      </div>
    </>
  )
}
export default Table;
