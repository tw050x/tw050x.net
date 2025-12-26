"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypedTreeItem = void 0;
const vscode_1 = require("vscode");
/**
 * Typed Tree Item
 *
 */
class TypedTreeItem extends vscode_1.TreeItem {
    /**
     * Defines the type of tree item.
     */
    type;
    /**
     * Constructor
     */
    constructor(type, label, collapsibleState) {
        super(label, collapsibleState);
        this.type = type;
    }
}
exports.TypedTreeItem = TypedTreeItem;
//# sourceMappingURL=TypedTreeItem.js.map