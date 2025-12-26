"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceActionTreeItem = void 0;
const vscode_1 = require("vscode");
/**
 * Workspace Action Tree Item
 *
 */
class WorkspaceActionTreeItem extends vscode_1.TreeItem {
    /**
     * Defines the type of tree item.
     */
    type = "workspace-action";
    /**
     * Constructor
     */
    constructor({ label, collapsibleState }) {
        super(label, collapsibleState);
    }
}
exports.WorkspaceActionTreeItem = WorkspaceActionTreeItem;
//# sourceMappingURL=WorkspaceAction.js.map