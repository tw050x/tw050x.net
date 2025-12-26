import { Command, ThemeIcon, TreeItemCollapsibleState } from "vscode";
import { TypedTreeItem } from "./TypedTreeItem";
import { TypedTreeItemType } from "../../types";

/**
 * Action Tree Item
 *
 */
export class ActionTreeItem<T extends TypedTreeItemType> extends TypedTreeItem<T> {

  /**
   * Constructor
   */
  constructor(type: T, label: string) {
    super(type, label, TreeItemCollapsibleState.None);
  }

  /**
   *
   */
  setCommand(command: Command) {
    this.command = command;
  }

  /**
   *
   */
  setIconPath(iconPath: ThemeIcon) {
    this.iconPath = iconPath;
  }
}
