"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceTreeItem = void 0;
const TypedTreeItem_1 = require("./TypedTreeItem");
/**
 * Workspace Tree Item
 *
 */
class WorkspaceTreeItem extends TypedTreeItem_1.TypedTreeItem {
    /**
     * Defines the type of tree item.
     */
    uri;
    /**
     * Constructor
     */
    constructor(type, label, collapsibleState) {
        super(type, label, collapsibleState);
    }
    /**
     * Sets the URI of the tree item.
     *
     */
    setUri(uri) {
        this.uri = uri;
    }
    /**
     * Sets the icon path of the tree item.
     *
     */
    setIconPath(iconPath) {
        this.iconPath = iconPath;
    }
}
exports.WorkspaceTreeItem = WorkspaceTreeItem;
//# sourceMappingURL=WorkspaceTreeItem.js.map