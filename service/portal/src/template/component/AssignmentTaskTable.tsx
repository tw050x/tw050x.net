import { Component } from "@kitajs/html";
import { TaskDocument } from "@tw050x.net.database/assignment";
import { default as Table } from "@tw050x.net.library/uikit/component/Table";

/**
 * Props for the `<AssignmentTaskTable />` component.
 */
export type Props = {
  tasks: Array<TaskDocument>;
};

/**
 * The `<AssignmentTaskTable />` component.
 *
 * @prop tasks - The list of assignment tasks to display in the table.
 * @returns {JSX.Element}
 */
const AssignmentTaskTable: Component<Props> = (props) => {
  return (
    <>
      <Table></Table>
    </>
  );
}
export default AssignmentTaskTable;
