import { ThemeIcon, TreeItemCollapsibleState, Uri } from "vscode";
import { TypedTreeItem } from "./TypedTreeItem";
import { TypedTreeItemType } from "../../types";

/**
 * Directory Tree Item
 *
 */
export class DirectoryTreeItem<T extends TypedTreeItemType> extends TypedTreeItem<T> {

  /**
   * Defines the type of tree item.
   */
  uri?: Uri;

  /**
   * Constructor
   */
  constructor(type: T, label: string, collapsibleState: TreeItemCollapsibleState) {
    super(type, label, collapsibleState);
  }

  /**
   * Sets the URI of the tree item.
   *
   */
  setUri(uri: Uri) {
    this.uri = uri;
  }

  /**
   * Sets the icon path of the tree item.
   *
   */
  setIconPath(iconPath: ThemeIcon) {
    this.iconPath = iconPath;
  }
}
