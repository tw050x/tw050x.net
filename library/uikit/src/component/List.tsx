import { Component } from "@kitajs/html";
import { default as CheckCircle } from "../svg/CheckCircle";
import { default as CheckCircleSelected } from "../svg/CheckCircleSelected";
import { default as ArrowCircleRight } from "../svg/ArrowCircleRight";

type TaskListItem = {
  completed: boolean;
  detail?: string;
  href: string;
  label: string;
}

type Props =
| {
  items: Array<TaskListItem>
  type: 'task-list'
}

/**
 * The `<List />` component.
 *
 * @param props
 * @returns {JSX.Element}
 */
const List: Component<Props> = ({ children, items, type }) => {
  childrenGuard: {
    if (children === null) break childrenGuard;
    if (children === undefined) break childrenGuard;
    throw new Error('The <List /> component must not have children.');
  }

  return (
    <div
      class={[
        "space-y-4",
      ]}
      data-component="list"
    >
      {items.map((item) => {
        if (type === 'task-list') {
          return (
            <div
              class={[
                "flex flex-row py-2",
                "border border-gray-300",
                "items-center",
                "p-4",
                "rounded-md",
              ]}
              data-sub-component="list-item"
            >
              <div class="pr-4">{item.completed ? <CheckCircleSelected /> : <CheckCircle />}</div>
              <div class="flex flex-1">
                <span>{item.label}</span>
                {item.detail && <span>{item.detail}</span>}
              </div>
              {item.completed ? null : (
                <div>
                  <a href={item.href}>
                    <ArrowCircleRight />
                  </a>
                </div>
              )}
            </div>
          )
        }
      })}
    </div>
  );
}
export default List;
