"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyTreeItem = void 0;
const vscode_1 = require("vscode");
const TypedTreeItem_1 = require("./TypedTreeItem");
/**
 * Empty Tree Item
 *
 */
class EmptyTreeItem extends TypedTreeItem_1.TypedTreeItem {
    /**
     * Constructor
     */
    constructor(type, label) {
        super(type, label, vscode_1.TreeItemCollapsibleState.None);
    }
    /**
     *
     */
    setTooltip(tooltip) {
        this.tooltip = tooltip;
    }
    /**
     *
     */
    setIconPath(iconPath) {
        this.iconPath = iconPath;
    }
}
exports.EmptyTreeItem = EmptyTreeItem;
//# sourceMappingURL=EmptyTreeItem.js.map