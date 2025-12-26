"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionTreeItem = void 0;
const vscode_1 = require("vscode");
const TypedTreeItem_1 = require("./TypedTreeItem");
/**
 * Action Tree Item
 *
 */
class ActionTreeItem extends TypedTreeItem_1.TypedTreeItem {
    /**
     * Constructor
     */
    constructor(type, label) {
        super(type, label, vscode_1.TreeItemCollapsibleState.None);
    }
    /**
     *
     */
    setCommand(command) {
        this.command = command;
    }
    /**
     *
     */
    setIconPath(iconPath) {
        this.iconPath = iconPath;
    }
}
exports.ActionTreeItem = ActionTreeItem;
//# sourceMappingURL=ActionTreeItem.js.map