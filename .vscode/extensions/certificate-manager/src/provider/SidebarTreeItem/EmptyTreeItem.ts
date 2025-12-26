import { Command, ThemeIcon, TreeItemCollapsibleState } from "vscode";
import { TypedTreeItem } from "./TypedTreeItem";

/**
 * Empty Tree Item
 *
 */
export class EmptyTreeItem<T extends string> extends TypedTreeItem<T> {

  /**
   * Constructor
   */
  constructor(type: T, label: string) {
    super(type, label, TreeItemCollapsibleState.None);
  }

  /**
   *
   */
  setTooltip(tooltip: string) {
    this.tooltip = tooltip;
  }

  /**
   *
   */
  setIconPath(iconPath: ThemeIcon) {
    this.iconPath = iconPath;
  }
}
