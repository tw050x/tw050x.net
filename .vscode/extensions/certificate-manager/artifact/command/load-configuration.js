"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandId = void 0;
exports.registerLoadConfigurationCommand = registerLoadConfigurationCommand;
const vscode_1 = require("vscode");
const cache_1 = require("../cache");
/**
 *
 */
exports.commandId = "certificate-manager.loadConfiguration";
/**
 * Loads .certificates.json config files from all workspace folders.
 */
async function loadConfiguration(workspaceFolder) {
    cache_1.configurations.delete(workspaceFolder.uri.fsPath);
    const configFileUri = vscode_1.Uri.joinPath(workspaceFolder.uri, ".certificates.json");
    const configFilePath = configFileUri.fsPath;
    let loadedCount = 0;
    // if file does not exist, return
    try {
        await vscode_1.workspace.fs.stat(configFileUri);
    }
    catch {
        return void vscode_1.window.showWarningMessage(`No configuration file found at ${configFilePath}.`);
    }
    // read and parse configuration file
    try {
        const fileData = await vscode_1.workspace.fs.readFile(configFileUri);
        const fileContent = Buffer.from(fileData).toString("utf8");
        const config = JSON.parse(fileContent);
        loadedCount++;
        cache_1.configurations.set(configFilePath, config);
    }
    catch (error) {
        return void vscode_1.window.showWarningMessage(`Could not read configuration file at ${configFilePath}. Reason: ${error}`);
    }
    vscode_1.window.showInformationMessage(`Certificate Manager loaded the configuration file.`);
}
/**
 * Registers the load configurations command.
 */
function registerLoadConfigurationCommand(context) {
    const handler = async (workspaceFolder) => {
        if (workspaceFolder === undefined) {
            const folder = await vscode_1.window.showWorkspaceFolderPick({
                placeHolder: "Select a workspace folder to open .certificates.json",
            });
            if (folder === undefined) {
                return;
            }
            workspaceFolder = folder;
        }
        await loadConfiguration(workspaceFolder);
    };
    context.subscriptions.push(vscode_1.commands.registerCommand(exports.commandId, handler));
}
//# sourceMappingURL=load-configuration.js.map