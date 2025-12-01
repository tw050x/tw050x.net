import { Component } from "@kitajs/html";

/**
 *
 */
export type Column = {
  dynamicValue?: (row: Row) => string;
  label: string;
  sortable: boolean;
}

/**
 *
 */
export type Row = {

}

/**
 * Props for the `<Table />` component.
 */
export type Props = {
  gridColsClass: string;
  columns: Array<Column>;
  rows: Array<Row>;
}

/**
 * The `<Table />` component.
 *
 * @param props The props for the component.
 * @param props.gridColsClass
 * An optional string representing the CSS class for grid columns. For example. `grid-cols-[200px_minmax(0,_1fr)_100px]`.
 * This will create a grid with three columns: the first column is 200px wide, the second column takes up the remaining space, and the third column is 100px wide.
 * The gridColsClass prop must match the format `grid-cols-[...]`
 *
 * **This string must not be dynamic. It must be a static string defined at compile time.**
 * @param props.columns An array of column definitions for the table.
 * @param props.rows An array of row data for the table.
 *
 * @example
 *
 * // basic usage
 * <Table
 *   columns={columns}
 *   rows={rows}
 * />
 *
 * // with defined grid columns
 * <Table
 *   gridColsClass="grid-cols-[200px_minmax(0,_1fr)_100px]"
 *   columns={columns}
 *   rows={rows}
 * />
 *
 * // with defined grid columns
 * <Table
 *   gridColsClass="grid-cols-[2fr_2fr_1fr]"
 *   columns={columns}
 *   rows={rows}
 * />
 *
 * @returns a JSX.Element
 */
const Table: Component<Props> = (props) => {

  if (props.gridColsClass.match(/^grid-cols-\[.*\]$/) === null) {
    throw new Error(`The gridColsClass prop must match the format 'grid-cols-[...]'. Received: ${props.gridColsClass}`);
  }

  // determine the grid columns class based on the number of columns
  let gridColumnsClass;
  switch (props.columns.length) {
    case 1:
      gridColumnsClass = 'grid-cols-1'
      break;
    case 2:
      gridColumnsClass = 'grid-cols-2'
      break;
    case 3:
      gridColumnsClass = 'grid-cols-3'
      break;
    case 4:
      gridColumnsClass = 'grid-cols-4'
      break;
    case 5:
      gridColumnsClass = 'grid-cols-5'
      break;
    case 6:
      gridColumnsClass = 'grid-cols-6'
      break;
    case 7:
      gridColumnsClass = 'grid-cols-7'
      break;
    case 8:
      gridColumnsClass = 'grid-cols-8'
      break;
    case 9:
      gridColumnsClass = 'grid-cols-9'
      break;
    case 10:
      gridColumnsClass = 'grid-cols-10'
      break;
    case 11:
      gridColumnsClass = 'grid-cols-11'
      break;
    case 12:
      gridColumnsClass = 'grid-cols-12'
      break;
    default:
      throw new Error(`The number of columns must be between 1 and 12. Received: ${props.columns.length}`);
  }

  const classes: Array<string> = [
    `grid ${gridColumnsClass} gap-4`,
  ]

  return (
    <div
      class={[
        ...classes,
        ...((typeof props.gridColsClass === 'string' ? [props.gridColsClass] : [])),
      ]}
      data-component="table"
    >

    </div>
  )
}
export default Table;
