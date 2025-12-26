import { TreeItem, TreeItemCollapsibleState } from "vscode";

/**
 * Typed Tree Item
 *
 */
export class TypedTreeItem<T extends string> extends TreeItem {

  /**
   * Defines the type of tree item.
   */
  readonly type: T;

  /**
   * Constructor
   */
  constructor(type: T, label: string, collapsibleState: TreeItemCollapsibleState) {
    super(label, collapsibleState);
    this.type = type;
  }
}
