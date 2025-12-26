"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandId = void 0;
exports.registerLoadConfigurationsCommand = registerLoadConfigurationsCommand;
const vscode_1 = require("vscode");
/**
 *
 */
exports.commandId = "certificate-manager.loadConfigurations";
/**
 * Configuration storage.
 */
const configurations = new Map();
/**
 * Loads .certificates.json config files from all workspace folders.
 */
async function loadConfigurations() {
    if (vscode_1.workspace.workspaceFolders === undefined || vscode_1.workspace.workspaceFolders.length === 0) {
        return void vscode_1.window.showWarningMessage("No workspace folder is open. Certificate Manager cannot load configuration.");
    }
    configurations.clear();
    let loadedCount = 0;
    for (const folder of vscode_1.workspace.workspaceFolders) {
        const configFileUri = vscode_1.Uri.joinPath(folder.uri, ".certificates.json");
        const configFilePath = configFileUri.fsPath;
        // if file does not exist, skip iteration
        try {
            await vscode_1.workspace.fs.stat(configFileUri);
        }
        catch {
            continue;
        }
        // read and parse configuration file
        try {
            const fileData = await vscode_1.workspace.fs.readFile(configFileUri);
            const fileContent = Buffer.from(fileData).toString("utf8");
            const config = JSON.parse(fileContent);
            loadedCount++;
            configurations.set(configFilePath, config);
        }
        catch (error) {
            vscode_1.window.showWarningMessage(`Could not read configuration file at ${configFilePath}. Reason: ${error}`);
            continue;
        }
    }
    if (loadedCount === 0) {
        return void vscode_1.window.showWarningMessage("No configuration files were found in the workspace folders.");
    }
    vscode_1.window.showInformationMessage(`Certificate Manager loaded ${loadedCount} configuration file(s).`);
}
/**
 * Registers the load configurations command.
 */
function registerLoadConfigurationsCommand(context) {
    const handler = async () => {
        await loadConfigurations();
    };
    context.subscriptions.push(vscode_1.commands.registerCommand(exports.commandId, handler));
}
//# sourceMappingURL=load-configurations.js.map