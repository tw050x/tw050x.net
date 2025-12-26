"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootActionTreeItem = void 0;
const vscode_1 = require("vscode");
/**
 * Root Tree Item
 *
 */
class RootActionTreeItem extends vscode_1.TreeItem {
    /**
     * Defines the type of tree item.
     */
    type = "root-action";
    /**
     * Constructor
     */
    constructor(options) {
        super(options.label, options.collapsibleState);
        this.command = options.command;
        this.iconPath = options.iconPath;
    }
}
exports.RootActionTreeItem = RootActionTreeItem;
//# sourceMappingURL=Action.js.map