import { Component } from "@kitajs/html";
import { default as Header } from "@tw050x.net.library/uikit/component/Header";
import { default as List } from "@tw050x.net.library/uikit/component/List";
import { default as Notice } from "@tw050x.net.library/uikit/component/Notice";
import { default as Paragraph } from "@tw050x.net.library/uikit/component/Paragraph";

/**
 * Props for the `<WelcomeOwner />` component.
 */
export type Props = {};

/**
 * The `<WelcomeOwner />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const WelcomeOwner: Component<Props> = (props) => {
  return (
    <>
      <div class="m-4">
        <Notice type="thankful">We sincerely thank you for signing up to the unnamed ecommerce platform.</Notice>
      </div>
      <div class="m-4">
        <Header tier="h2">Getting Started</Header>
      </div>
      <div class="m-4">
        <Paragraph>We have created a list of tasks for you to get you started. You can come back to this page anytime to review your progress.</Paragraph>
      </div>
      <div class="m-4">
        <List
          items={[
            { completed: false, href: '#', label: 'Task 1' },
            { completed: false, href: '#', label: 'Task 2' },
            { completed: true, href: '#', label: 'Task 3' },
          ]}
          type="task-list"
        />
      </div>
    </>
  );
}
export default WelcomeOwner;
