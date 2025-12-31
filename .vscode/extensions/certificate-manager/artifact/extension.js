"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const jsx_runtime_1 = require("@kitajs/html/jsx-runtime");
const vscode_1 = require("vscode");
const CreateCertificateAuthorityForm_1 = require("./component/CreateCertificateAuthorityForm");
const SidebarTreeDataProvider_1 = __importDefault(require("./provider/SidebarTreeDataProvider"));
const cache_1 = require("./cache");
/**
 * Activate the extension.
 *
 * @param context
 */
async function activate(context) {
    // Setup Sidebar
    const sidebarTreeDataProvider = new SidebarTreeDataProvider_1.default();
    const sidebarDisposable = vscode_1.window.registerTreeDataProvider('certificate-manager--sidebar', sidebarTreeDataProvider);
    context.subscriptions.push(sidebarDisposable);
    // Watch for changes in the workspace to refresh the sidebar
    const refreshSidebarTreeDataProvider = () => {
        sidebarTreeDataProvider.refresh();
    };
    const workspaceFoldersChangeDisposable = vscode_1.workspace.onDidChangeWorkspaceFolders(refreshSidebarTreeDataProvider);
    context.subscriptions.push(workspaceFoldersChangeDisposable);
    // Watch for changes to .certificates.json files in the workspaces
    const fileSystemWatcher = vscode_1.workspace.createFileSystemWatcher('**/.certificates.json');
    const fileChangeDisposable = fileSystemWatcher.onDidChange(refreshSidebarTreeDataProvider);
    const fileCreateDisposable = fileSystemWatcher.onDidCreate(refreshSidebarTreeDataProvider);
    const fileDeleteDisposable = fileSystemWatcher.onDidDelete(refreshSidebarTreeDataProvider);
    context.subscriptions.push(fileChangeDisposable);
    context.subscriptions.push(fileCreateDisposable);
    context.subscriptions.push(fileDeleteDisposable);
    context.subscriptions.push(fileSystemWatcher);
    // Watch for changes to any certificate files in the workspace
    const onDidChangeConfiguration = (event) => {
        if (event.affectsConfiguration('@tw050x.net/certificate-manager.sidebar')) {
            refreshSidebarTreeDataProvider();
        }
    };
    const configurationChangeDisposable = vscode_1.workspace.onDidChangeConfiguration(onDidChangeConfiguration);
    context.subscriptions.push(configurationChangeDisposable);
    // Register open create certificate authority form command
    let openCreateCertificateAuthorityFormWebviewPanel = undefined;
    const clearOpenCreateCertificateAuthorityFormWebviewPanel = () => {
        openCreateCertificateAuthorityFormWebviewPanel = undefined;
    };
    const openCreateCertificateAuthorityFormHandler = async () => {
        if (openCreateCertificateAuthorityFormWebviewPanel === undefined) {
            openCreateCertificateAuthorityFormWebviewPanel = vscode_1.window.createWebviewPanel('certificateAuthorityForm', 'Certificate Authority Form', vscode_1.ViewColumn.Active);
            openCreateCertificateAuthorityFormWebviewPanel.webview.html = await (0, jsx_runtime_1.jsx)(CreateCertificateAuthorityForm_1.CreateCertificateAuthorityForm, {});
            openCreateCertificateAuthorityFormWebviewPanel.onDidDispose(clearOpenCreateCertificateAuthorityFormWebviewPanel);
        }
        if (openCreateCertificateAuthorityFormWebviewPanel.visible === false) {
            openCreateCertificateAuthorityFormWebviewPanel.reveal(vscode_1.ViewColumn.Active);
        }
    };
    const openCreateCertificateAuthorityFormDisposable = vscode_1.commands.registerCommand('certificate-manager.openCreateCertificateAuthorityForm', openCreateCertificateAuthorityFormHandler);
    context.subscriptions.push(openCreateCertificateAuthorityFormDisposable);
    const ensureWorkspaceFolderParameter = (handler) => {
        return async (workspaceFolder) => {
            if (workspaceFolder === undefined) {
                const folder = await vscode_1.window.showWorkspaceFolderPick({
                    placeHolder: "Select a workspace folder to create .certificates.json",
                });
                if (folder === undefined) {
                    return void vscode_1.window.showWarningMessage("No workspace folder selected. Cannot create .certificates.json file.");
                }
                workspaceFolder = folder;
            }
            await handler(workspaceFolder);
        };
    };
    // Helper to create configuration file URI
    const createConfigurationFileUri = (workspaceFolder) => {
        return vscode_1.Uri.joinPath(workspaceFolder.uri, ".certificates.json");
    };
    // Register create configuration file command
    const createConfigurationHandler = async (workspaceFolder) => {
        const configFileUri = createConfigurationFileUri(workspaceFolder);
        try {
            await vscode_1.workspace.fs.stat(configFileUri);
            const messageOptions = {
                modal: true,
                detail: "Creating a new configuration file will delete the existing one."
            };
            const overwrite = await vscode_1.window.showWarningMessage(`${workspaceFolder.uri.fsPath}/.certificates.json already exists.`, messageOptions, "Continue");
            if (overwrite !== "Continue") {
                return void vscode_1.window.showInformationMessage('Operation cancelled. Existing .certificates.json file was not overwritten.');
            }
        }
        catch {
            // file does not exist (probably); continue
        }
        try {
            const defaultContent = JSON.stringify({}, null, 2) + "\n";
            await vscode_1.workspace.fs.writeFile(configFileUri, Buffer.from(defaultContent, "utf8"));
        }
        catch (error) {
            vscode_1.window.showErrorMessage(`Failed to create .certificates.json file: ${error instanceof Error ? error.message : String(error)}`);
        }
        refreshSidebarTreeDataProvider();
        const doc = await vscode_1.workspace.openTextDocument(configFileUri);
        await vscode_1.window.showTextDocument(doc);
    };
    const createConfigurationDisposable = vscode_1.commands.registerCommand('certificate-manager.createConfigurationFile', ensureWorkspaceFolderParameter(createConfigurationHandler));
    context.subscriptions.push(createConfigurationDisposable);
    // Helper to read configuration file
    const readConfigurationFile = async (configFileUri) => {
        const fileData = await vscode_1.workspace.fs.readFile(configFileUri);
        const fileContent = Buffer.from(fileData).toString("utf8");
        return JSON.parse(fileContent);
    };
    // Register load configurations command
    const loadConfigurationHandler = async (workspaceFolder) => {
        const configFileUri = createConfigurationFileUri(workspaceFolder);
        try {
            await vscode_1.workspace.fs.stat(configFileUri);
        }
        catch {
            return void vscode_1.window.showErrorMessage(`No .certificates.json file found in workspace folder ${workspaceFolder.name}.`);
        }
        const configFilePath = configFileUri.fsPath;
        try {
            cache_1.configurations.set(configFilePath, await readConfigurationFile(configFileUri));
        }
        catch (error) {
            return void vscode_1.window.showErrorMessage(`Failed to load the configuration from ${configFilePath}. Reason: ${error instanceof Error ? error.message : String(error)}`);
        }
        vscode_1.window.showInformationMessage(`Loaded the configuration file from workspace folder ${workspaceFolder.name}.`);
    };
    const loadConfigurationDisposable = vscode_1.commands.registerCommand('certificate-manager.loadConfigurationFile', ensureWorkspaceFolderParameter(loadConfigurationHandler));
    context.subscriptions.push(loadConfigurationDisposable);
    const ensureWorkspaceFoldersParameter = (handler) => {
        return async (workspaceFolders) => {
            if (workspaceFolders === undefined) {
                workspaceFolders = vscode_1.workspace.workspaceFolders || [];
            }
            await handler(workspaceFolders);
        };
    };
    // Register load configurations command
    const loadConfigurationsHandler = async (workspaceFolders) => {
        let loadedCount = 0;
        for (const workspaceFolder of workspaceFolders) {
            const configFileUri = createConfigurationFileUri(workspaceFolder);
            try {
                await vscode_1.workspace.fs.stat(configFileUri);
            }
            catch {
                continue;
            }
            const configFilePath = configFileUri.fsPath;
            try {
                cache_1.configurations.set(configFilePath, await readConfigurationFile(configFileUri));
                loadedCount++;
            }
            catch (error) {
                continue;
            }
        }
        if (loadedCount === 0) {
            vscode_1.window.showWarningMessage("No configuration files were found in the workspace folders.");
        }
        else {
            vscode_1.window.showInformationMessage(`Certificate Manager loaded ${loadedCount} configuration file(s).`);
        }
    };
    const loadConfigurationsDisposable = vscode_1.commands.registerCommand('certificate-manager.loadConfigurationFiles', ensureWorkspaceFoldersParameter(loadConfigurationsHandler));
    context.subscriptions.push(loadConfigurationsDisposable);
    // Register open configuration command
    const openConfigurationFileCommandHandler = async (workspaceFolder) => {
        const configFileUri = createConfigurationFileUri(workspaceFolder);
        const document = await vscode_1.workspace.openTextDocument(configFileUri);
        await vscode_1.window.showTextDocument(document);
    };
    const openConfigurationDisposable = vscode_1.commands.registerCommand('certificate-manager.openConfigurationFile', ensureWorkspaceFolderParameter(openConfigurationFileCommandHandler));
    context.subscriptions.push(openConfigurationDisposable);
    // Helper to create documentation file URI
    const createDocumentationFileUri = () => {
        return vscode_1.Uri.joinPath(context.extensionUri, "documentation", "getting-started.md");
    };
    // Register open documentation command
    const openDocumentationHandler = async () => {
        const documentationUri = createDocumentationFileUri();
        await vscode_1.commands.executeCommand('markdown.showPreview', documentationUri);
    };
    const openDocumentationDisposable = vscode_1.commands.registerCommand('certificate-manager.openDocumentation', openDocumentationHandler);
    context.subscriptions.push(openDocumentationDisposable);
    // Initial load of configurations
    await vscode_1.commands.executeCommand('certificate-manager.loadConfigurationFiles');
}
/**
 * Deactivate the extension.
 *
 */
function deactivate() {
    console.log('Certificate extension deactivated');
}
//# sourceMappingURL=extension.js.map