import { Component } from "@kitajs/html";
import { default as Table, Column, Row } from "@tw050x.net.library/uikit/component/Table";

export type AssignmentTaskWithTemplate = {
  template: {
    label: string;
    description: string;
  };
  assignedBy: string;
}

/**
 * Props for the `<AssignmentTaskTable />` component.
 */
export type Props = {
  tasks: Array<AssignmentTaskWithTemplate>;
};

/**
 * The `<AssignmentTaskTable />` component.
 *
 * @prop tasks - The list of assignment tasks to display in the table.
 * @returns {JSX.Element}
 */
const AssignmentTaskTable: Component<Props> = (props) => {
  const columns: Array<Column> = [
    {
      label: 'Label',
      sortable: false,
    },
    {
      label: 'Description',
      sortable: false,
    },
    {
      label: 'Assigned By',
      sortable: false,
    },
  ]

  const mapTaskToRow = (task: AssignmentTaskWithTemplate): Row => {
    return {
      type: 'text',
    }
  }

  return (
    <Table
      gridColsClass="grid-cols-[200px_minmax(0,_1fr)_100px]"
      columns={columns}
      rows={props.tasks.map(mapTaskToRow)}
    />
  );
}
export default AssignmentTaskTable;
