import { Component } from "@kitajs/html";
import { default as AnchoredBar } from "@tw050x.net.library/uikit/component/AnchoredBar";
import { default as Header } from "@tw050x.net.library/uikit/component/Header";
import { default as Htmx } from "@tw050x.net.library/uikit/component/Htmx";
import { default as Stylesheet } from "@tw050x.net.library/uikit/component/Stylesheet";
import { default as MenuInitiator, Props as MenuInitiatorProps } from "../component/MenuInitiator.js";
import { default as AssignmentTaskTable, Props as AssignmentTaskTableProps } from "../component/AssignmentTaskTable.js";

/**
 * Props for the `<Assignment />` component.
 */
export type Props = {
  assignmentTaskTableProps: AssignmentTaskTableProps;
  menuInitiatorProps: MenuInitiatorProps;
};

/**
 * The `<Assignment />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const Assignment: Component<Props> = (props) => {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <base href="/" />
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Assignments | Portal</title>
          <Htmx />
          <Stylesheet />
        </head>
        <body>
          <MenuInitiator {...props.menuInitiatorProps} />
          <main>
            <AnchoredBar id="page-header" position="top">
              <Header tier="h1">Assignments</Header>
            </AnchoredBar>
            <AssignmentTaskTable {...props.assignmentTaskTableProps} />
          </main>
        </body>
      </html>
    </>
  );
}
export default Assignment;
