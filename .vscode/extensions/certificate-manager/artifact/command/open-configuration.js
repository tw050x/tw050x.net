"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandId = void 0;
exports.registerOpenConfigurationCommand = registerOpenConfigurationCommand;
const vscode_1 = require("vscode");
/**
 *
 */
exports.commandId = "certificate-manager.openConfiguration";
/**
 * Opens a .certificates.json file in the given workspace folder.
 *
 * @param folder
 * @returns
 */
async function openConfigurationFile(uri) {
    const document = await vscode_1.workspace.openTextDocument(vscode_1.Uri.joinPath(uri, ".certificates.json"));
    await vscode_1.window.showTextDocument(document);
}
/**
 * Registers the openConfiguration command.
 *
 * @param options
 * @returns
 */
function registerOpenConfigurationCommand(context) {
    const handler = async (uri) => {
        if (uri === undefined) {
            const folder = await vscode_1.window.showWorkspaceFolderPick({
                placeHolder: "Select a workspace folder to open .certificates.json",
            });
            if (!folder) {
                return;
            }
            uri = folder.uri;
        }
        await openConfigurationFile(uri);
    };
    context.subscriptions.push(vscode_1.commands.registerCommand(exports.commandId, handler));
}
//# sourceMappingURL=open-configuration.js.map