"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootTreeItem = void 0;
const vscode_1 = require("vscode");
/**
 * Root Tree Item
 *
 */
class RootTreeItem extends vscode_1.TreeItem {
    /**
     * Defines the type of tree item.
     */
    type = "root";
    /**
     * Constructor
     */
    constructor({ label, collapsibleState }) {
        super(label, collapsibleState);
    }
}
exports.RootTreeItem = RootTreeItem;
//# sourceMappingURL=Root.js.map