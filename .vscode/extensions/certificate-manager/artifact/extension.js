"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const jsx_runtime_1 = require("@kitajs/html/jsx-runtime");
const vscode_1 = require("vscode");
const node_os_1 = require("node:os");
const node_crypto_1 = require("node:crypto");
const CertificateAuthorityForm_1 = require("./component/CertificateAuthorityForm");
const SidebarTreeDataProvider_1 = __importDefault(require("./provider/SidebarTreeDataProvider"));
const cache_1 = require("./cache");
const package_json_1 = __importDefault(require("../package.json"));
/**
 * Activate the extension.
 *
 * @param context
 */
async function activate(context) {
    // Helper to get default storage path
    const getConfiguredStorageDirectoryPath = () => {
        const config = vscode_1.workspace.getConfiguration('@tw050x.net/certificate-manager');
        const configuredPath = config.get('storage.directoryPath');
        if (configuredPath !== null && configuredPath !== undefined && configuredPath.trim() !== '') {
            return configuredPath;
        }
        return vscode_1.Uri.joinPath(vscode_1.Uri.file((0, node_os_1.homedir)()), '.certificates').fsPath;
    };
    // Helper to get default certificate settings
    const getConfiguredCertificateKeySize = () => {
        const config = vscode_1.workspace.getConfiguration('@tw050x.net/certificate-manager');
        const configuredKeySize = config.get('certificate.keySize');
        return configuredKeySize ?? package_json_1.default.contributes.configuration.properties['@tw050x.net/certificate-manager.certificate.keySize'].default;
    };
    // Helper to get default certificate settings
    const getConfiguredCertificateValidityDays = () => {
        const config = vscode_1.workspace.getConfiguration('@tw050x.net/certificate-manager');
        const configuredValidityDays = config.get('certificate.validityDays');
        return configuredValidityDays ?? package_json_1.default.contributes.configuration.properties['@tw050x.net/certificate-manager.certificate.validityDays'].default;
    };
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
    let openCertificateAuthorityFormWebviewPanel = undefined;
    const clearOpenCertificateAuthorityFormWebviewPanel = () => {
        openCertificateAuthorityFormWebviewPanel = undefined;
    };
    const parseJsonObject = (text) => {
        const parsed = JSON.parse(text);
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error('Expected JSON object at root.');
        }
        return parsed;
    };
    const setIfNonEmptyString = (target, key, value) => {
        const trimmed = value.trim();
        if (trimmed !== '') {
            target[key] = trimmed;
        }
    };
    const setIfNumber = (target, key, value) => {
        if (value !== null && Number.isFinite(value)) {
            target[key] = value;
        }
    };
    const isNonEmptyObject = (value) => {
        return Object.keys(value).length > 0;
    };
    const upsertCertificateAuthorityInConfiguration = (configuration, payload) => {
        const next = { ...configuration };
        const authoritiesRaw = next.authorities;
        const authorities = (authoritiesRaw !== undefined && authoritiesRaw !== null && typeof authoritiesRaw === 'object' && !Array.isArray(authoritiesRaw)
            ? authoritiesRaw
            : {});
        const authorityEntry = {};
        // certificate-subject
        const certificateSubject = {};
        setIfNonEmptyString(certificateSubject, 'commonName', payload.certificateCommonName);
        setIfNonEmptyString(certificateSubject, 'organization', payload.certificateOrganization);
        setIfNonEmptyString(certificateSubject, 'organizationalUnit', payload.certificateOrganizationalUnit);
        setIfNonEmptyString(certificateSubject, 'locality', payload.certificateLocality);
        setIfNonEmptyString(certificateSubject, 'state', payload.certificateStateOrProvince);
        setIfNonEmptyString(certificateSubject, 'country', payload.certificateCountry);
        setIfNonEmptyString(certificateSubject, 'email', payload.certificateEmailAddress);
        if (isNonEmptyObject(certificateSubject)) {
            authorityEntry['certificateSubject'] = certificateSubject;
        }
        // certificate-configuration
        const certificateConfiguration = {};
        if (payload.certificateKeySizeUseDefault === false) {
            setIfNumber(certificateConfiguration, 'keySize', payload.certificateKeySize);
        }
        if (isNonEmptyObject(certificateConfiguration)) {
            authorityEntry['certificateConfiguration'] = certificateConfiguration;
        }
        // certificate-validity
        const certificateValidity = {};
        if (payload.certificateValidityDaysUseDefault === false) {
            setIfNumber(certificateValidity, 'days', payload.certificateValidityDays);
        }
        if (isNonEmptyObject(certificateValidity)) {
            authorityEntry['certificateValidity'] = certificateValidity;
        }
        // storage
        const storage = {};
        if (payload.storageDirectoryPathUseDefault === false) {
            setIfNonEmptyString(storage, 'directoryPath', payload.storageDirectoryPath);
        }
        if (isNonEmptyObject(storage)) {
            authorityEntry['storage'] = storage;
        }
        authorities[payload.uuid] = authorityEntry;
        next.authorities = authorities;
        return next;
    };
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
    // Helper to read configuration file
    const readConfigurationFile = async (configFileUri) => {
        const fileData = await vscode_1.workspace.fs.readFile(configFileUri);
        const fileContent = Buffer.from(fileData).toString("utf8");
        return JSON.parse(fileContent);
    };
    // Handler for messages from Certificate Authority Form webview
    const openCertificateAuthorityFormMessageHandler = async (message) => {
        if (message === undefined) {
            return void vscode_1.window.showInformationMessage('No message received from Certificate Authority Form webview.');
        }
        if (message.type === 'submitCertificateAuthorityForm') {
            vscode_1.window.setStatusBarMessage('Saving Certificate Authority…', 2000);
            try {
                const selectedWorkspaceFolderUri = message.payload.workspaceFolderUri.trim();
                const workspaceFolder = vscode_1.workspace.getWorkspaceFolder(vscode_1.Uri.parse(selectedWorkspaceFolderUri));
                if (workspaceFolder === undefined) {
                    return void vscode_1.window.showWarningMessage('Selected workspace folder is not available. Cannot save Certificate Authority.');
                }
                const configFileUri = createConfigurationFileUri(workspaceFolder);
                let existing = {};
                try {
                    const raw = await vscode_1.workspace.fs.readFile(configFileUri);
                    const text = Buffer.from(raw).toString('utf8');
                    existing = parseJsonObject(text);
                }
                catch {
                    // Missing or unreadable config file; create fresh.
                    existing = {};
                }
                const updated = upsertCertificateAuthorityInConfiguration(existing, message.payload);
                const nextContent = JSON.stringify(updated, null, 2) + '\n';
                await vscode_1.workspace.fs.writeFile(configFileUri, Buffer.from(nextContent, 'utf8'));
                await openCertificateAuthorityFormWebviewPanel?.webview.postMessage({
                    type: 'certificateAuthorityFormValidationResult',
                    fieldErrors: {},
                });
                refreshSidebarTreeDataProvider();
                return void vscode_1.window.showInformationMessage('Certificate Authority saved to .certificates.json.');
            }
            catch (error) {
                await openCertificateAuthorityFormWebviewPanel?.webview.postMessage({
                    type: 'certificateAuthorityFormValidationResult',
                    fieldErrors: {},
                });
                return void vscode_1.window.showErrorMessage(`Failed to save Certificate Authority: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        if (message.type === 'confirmResetInitial') {
            const selection = await vscode_1.window.showWarningMessage('Reset all fields to their initial values?', { modal: true }, 'Reset');
            const ok = selection === 'Reset';
            return void await openCertificateAuthorityFormWebviewPanel?.webview.postMessage({
                type: 'confirmResetInitialResult',
                ok,
            });
        }
    };
    const openCertificateAuthorityFormHandler = async (workspaceFolder, certificateAuthorityUUID) => {
        if (openCertificateAuthorityFormWebviewPanel === undefined) {
            const viewType = 'certificateAuthorityForm';
            const title = 'Certificate Authority Form';
            const showOptions = vscode_1.ViewColumn.Active;
            const options = {
                enableScripts: true,
            };
            openCertificateAuthorityFormWebviewPanel = vscode_1.window.createWebviewPanel(viewType, title, showOptions, options);
            openCertificateAuthorityFormWebviewPanel.webview.onDidReceiveMessage(openCertificateAuthorityFormMessageHandler);
            openCertificateAuthorityFormWebviewPanel.onDidDispose(clearOpenCertificateAuthorityFormWebviewPanel);
        }
        const configuredCertificateKeySize = getConfiguredCertificateKeySize();
        const configuredCertificateValidityDays = getConfiguredCertificateValidityDays();
        const configuredStorageDirectoryPath = getConfiguredStorageDirectoryPath();
        const formInitialValues = {};
        if (certificateAuthorityUUID !== undefined) {
            const configFileUri = createConfigurationFileUri(workspaceFolder);
            const configuration = await readConfigurationFile(configFileUri);
            formInitialValues['certificateCommonName'] = configuration.authorities?.[certificateAuthorityUUID]?.certificateSubject?.commonName;
            formInitialValues['uuid'] = certificateAuthorityUUID;
        }
        openCertificateAuthorityFormWebviewPanel.webview.html = await ((0, jsx_runtime_1.jsx)(CertificateAuthorityForm_1.CertificateAuthorityForm, { formSelectionOptions: {
                workspaceFolders: (vscode_1.workspace.workspaceFolders ?? []).map((folder) => ({
                    uri: folder.uri.toString(),
                    name: folder.name,
                })),
            }, formDefaultValues: {
                certificateKeySize: configuredCertificateKeySize,
                certificateValidityDays: configuredCertificateValidityDays,
                storageDirectoryPath: configuredStorageDirectoryPath,
            }, formInitialValues: {
                certificateCommonName: '',
                certificateCountry: '',
                certificateEmailAddress: '',
                certificateKeySize: configuredCertificateKeySize,
                certificateKeySizeUseDefault: true,
                certificateValidityDays: configuredCertificateValidityDays,
                certificateValidityDaysUseDefault: true,
                storageDirectoryPathUseDefault: true,
                storageDirectoryPath: configuredStorageDirectoryPath,
                uuid: certificateAuthorityUUID ?? (0, node_crypto_1.randomUUID)(),
                workspaceFolderUri: workspaceFolder.uri.toString(),
            } }));
        if (openCertificateAuthorityFormWebviewPanel.visible === false) {
            openCertificateAuthorityFormWebviewPanel.reveal(vscode_1.ViewColumn.Active);
        }
    };
    const openCertificateAuthorityFormDisposable = vscode_1.commands.registerCommand('certificate-manager.openCertificateAuthorityForm', ensureWorkspaceFolderParameter(openCertificateAuthorityFormHandler));
    context.subscriptions.push(openCertificateAuthorityFormDisposable);
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
}
//# sourceMappingURL=extension.js.map