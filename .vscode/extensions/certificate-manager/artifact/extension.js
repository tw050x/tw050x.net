"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode_1 = require("vscode");
const create_configuration_1 = require("./command/create-configuration");
const load_configuration_1 = require("./command/load-configuration");
const load_configurations_1 = require("./command/load-configurations");
const open_create_certificate_authority_form_1 = require("./command/open-create-certificate-authority-form");
const open_configuration_1 = require("./command/open-configuration");
const open_documentation_1 = require("./command/open-documentation");
const SidebarTreeDataProvider_1 = __importDefault(require("./provider/SidebarTreeDataProvider"));
/**
 * Activate the extension.
 *
 * @param context
 */
async function activate(context) {
    const sidebarTreeDataProvider = new SidebarTreeDataProvider_1.default();
    context.subscriptions.push(vscode_1.window.registerTreeDataProvider('certificate-manager--sidebar', sidebarTreeDataProvider));
    const refreshSidebarTreeDataProvider = () => {
        sidebarTreeDataProvider.refresh();
    };
    context.subscriptions.push(vscode_1.workspace.onDidChangeWorkspaceFolders(() => {
        refreshSidebarTreeDataProvider();
    }));
    // Fallback: refresh when the document is saved (covers cases where FS events are coalesced or missed)
    const fileSystemWatcher = vscode_1.workspace.createFileSystemWatcher("**/.certificates.json");
    fileSystemWatcher.onDidChange(refreshSidebarTreeDataProvider);
    fileSystemWatcher.onDidCreate(refreshSidebarTreeDataProvider);
    fileSystemWatcher.onDidDelete(refreshSidebarTreeDataProvider);
    context.subscriptions.push(fileSystemWatcher);
    // Watch for changes to any certificate files in the workspace
    context.subscriptions.push(vscode_1.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("@tw050x.net/certificate-manager.sidebar")) {
            refreshSidebarTreeDataProvider();
        }
    }));
    // Register commands
    (0, create_configuration_1.registerCreateConfigurationCommand)(context, sidebarTreeDataProvider);
    (0, load_configuration_1.registerLoadConfigurationCommand)(context);
    (0, load_configurations_1.registerLoadConfigurationsCommand)(context);
    (0, open_create_certificate_authority_form_1.registerOpenCreateCertificateAuthorityFormCommand)(context);
    (0, open_configuration_1.registerOpenConfigurationCommand)(context);
    (0, open_documentation_1.registerOpenDocumentationCommand)(context);
    // Initial load of configurations
    await vscode_1.commands.executeCommand(load_configurations_1.commandId);
}
/**
 * Deactivate the extension.
 *
 */
function deactivate() {
    console.log("Certificate extension deactivated");
}
//# sourceMappingURL=extension.js.map