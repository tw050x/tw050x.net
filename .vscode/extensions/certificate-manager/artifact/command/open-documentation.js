"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandId = void 0;
exports.registerOpenDocumentationCommand = registerOpenDocumentationCommand;
const vscode_1 = require("vscode");
/**
 *
 */
exports.commandId = "certificate-manager.openDocumentation";
/**
 * Opens the documentation file in the specified workspace folder.
 *
 * @returns
 */
async function openDocumentationFile() {
    console.log("Open documentation file in folder:");
}
/**
 * Registers the createConfig command.
 *
 * @param options
 * @returns
 */
function registerOpenDocumentationCommand(context) {
    const handler = async () => {
        await openDocumentationFile();
    };
    context.subscriptions.push(vscode_1.commands.registerCommand(exports.commandId, handler));
}
//# sourceMappingURL=open-documentation.js.map