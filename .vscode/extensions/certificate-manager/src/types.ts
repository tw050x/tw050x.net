import { TreeItem } from "vscode";

/**
 * Typed Tree Item Types
 *
 */
export type TypedTreeItemType =
  | "create-configuration-file"
  | "load-configuration-file"
  | "open-configuration-file"
  | "open-documentation"
  | "no-configuration"
  | "no-workspaces"
  | "refresh-configuration-files"
  | "workspace"
  | "workspaces"

/**
 * Typed Tree Item
 *
 */
export interface TypedTreeItem extends TreeItem {

  /**
   * Defines the type of tree item.
   */
  type: TypedTreeItemType;
}

/**
 * TypedTreeItemOf TypedTree
 *
 */
export interface TypedTreeItemOf<T extends TypedTreeItemType> extends TypedTreeItem {
  type: T;
}
