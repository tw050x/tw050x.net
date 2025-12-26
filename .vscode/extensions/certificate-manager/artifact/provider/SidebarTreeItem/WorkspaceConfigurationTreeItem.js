"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceConfigurationTreeItem = void 0;
const vscode_1 = require("vscode");
/**
 * Certificate Authority Tree Item
 *
 */
class WorkspaceConfigurationTreeItem extends vscode_1.TreeItem {
    /**
     * Defines the type of tree item.
     */
    type = "workspace-configuration";
    /**
     * URI of the configuration file.
     */
    uri;
    /**
     * Constructor
     */
    constructor({ label, uri, collapsibleState }) {
        super(label, collapsibleState);
        this.uri = uri;
    }
}
exports.WorkspaceConfigurationTreeItem = WorkspaceConfigurationTreeItem;
//# sourceMappingURL=WorkspaceConfigurationTreeItem.js.map