"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationTreeItem = void 0;
const vscode_1 = require("vscode");
/**
 * Certificate Authority Tree Item
 *
 */
class ConfigurationTreeItem extends vscode_1.TreeItem {
    /**
     * Defines the type of tree item.
     */
    type = "configuration";
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
exports.ConfigurationTreeItem = ConfigurationTreeItem;
//# sourceMappingURL=Configuration.js.map