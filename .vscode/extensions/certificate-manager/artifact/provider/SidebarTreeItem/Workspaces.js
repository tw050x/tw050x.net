"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspacesTreeItem = void 0;
const vscode_1 = require("vscode");
/**
 * Workspace Tree Item
 *
 */
class WorkspacesTreeItem extends vscode_1.TreeItem {
    /**
     * Defines the type of tree item.
     */
    type = "workspace";
    /**
     * Constructor
     */
    constructor({ label, collapsibleState }) {
        super(label, collapsibleState);
    }
}
exports.WorkspacesTreeItem = WorkspacesTreeItem;
//# sourceMappingURL=Workspaces.js.map