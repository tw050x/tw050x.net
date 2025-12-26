"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandId = void 0;
exports.registerCreateConfigurationCommand = registerCreateConfigurationCommand;
const vscode_1 = require("vscode");
const load_configurations_1 = require("./load-configurations");
/**
 *
 */
exports.commandId = "certificate-manager.createConfiguration";
/**
 * Creates a .certificates.json file in the given workspace folder.
 *
 * @param folder
 * @returns
 */
async function createConfigurationFile(folder) {
    const configFileUri = vscode_1.Uri.joinPath(folder.uri, ".certificates.json");
    try {
        await vscode_1.workspace.fs.stat(configFileUri);
        const overwrite = await vscode_1.window.showWarningMessage(`${folder.uri.fsPath}/.certificates.json already exists.`, { modal: true, detail: "Creating a new configuration file will overwrite the existing one." }, "Overwrite");
        if (overwrite !== "Overwrite") {
            return;
        }
    }
    catch {
        // file does not exist; continue
    }
    const defaultContent = JSON.stringify({}, null, 2) + "\n";
    await vscode_1.workspace.fs.writeFile(configFileUri, Buffer.from(defaultContent, "utf8"));
}
/**
 * Registers the createConfig command.
 *
 * @param options
 * @returns
 */
function registerCreateConfigurationCommand(context, sidebarTreeDataProvider) {
    const handler = async () => {
        const folder = await vscode_1.window.showWorkspaceFolderPick({
            placeHolder: "Select a workspace folder to create .certificates.json",
        });
        if (!folder) {
            return;
        }
        await createConfigurationFile(folder);
        sidebarTreeDataProvider.refresh();
        await vscode_1.commands.executeCommand(load_configurations_1.commandId);
        const doc = await vscode_1.workspace.openTextDocument(vscode_1.Uri.joinPath(folder.uri, ".certificates.json"));
        await vscode_1.window.showTextDocument(doc);
    };
    context.subscriptions.push(vscode_1.commands.registerCommand(exports.commandId, handler));
}
//# sourceMappingURL=create-configuration.js.map