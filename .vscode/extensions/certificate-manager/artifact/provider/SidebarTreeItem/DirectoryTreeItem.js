"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectoryTreeItem = void 0;
const TypedTreeItem_1 = require("./TypedTreeItem");
/**
 * Directory Tree Item
 *
 */
class DirectoryTreeItem extends TypedTreeItem_1.TypedTreeItem {
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
exports.DirectoryTreeItem = DirectoryTreeItem;
//# sourceMappingURL=DirectoryTreeItem.js.map