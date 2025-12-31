"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const ActionTreeItem_1 = require("./SidebarTreeItem/ActionTreeItem");
const EmptyTreeItem_1 = require("./SidebarTreeItem/EmptyTreeItem");
const TypedTreeItem_1 = require("./SidebarTreeItem/TypedTreeItem");
const WorkspaceTreeItem_1 = require("./SidebarTreeItem/WorkspaceTreeItem");
/**
 * SidebarTreeDataProvider for the Certificate Authorities view.
 */
class SidebarTreeDataProvider {
    /**
     * Emitter for tree data changes.
     */
    changeEmitter = new vscode_1.EventEmitter();
    /**
     * Event fired when the tree data changes.
     */
    onDidChangeTreeData = this.changeEmitter.event;
    /**
     * Refresh the tree view.
     */
    refresh() {
        this.changeEmitter.fire();
    }
    /**
     * Get the tree item for the given element.
     *
     * @param element
     * @returns
     */
    getTreeItem(element) {
        return element;
    }
    /**
     * Get the children for the given element.
     *
     * @param element
     */
    async getChildren(element) {
        let children = [];
        // Check for workspace folders
        const folders = vscode_1.workspace.workspaceFolders ?? [];
        missingWorkspaceGuard: {
            if (folders.length > 0) {
                break missingWorkspaceGuard;
            }
            const noWorkspacesItem = new EmptyTreeItem_1.EmptyTreeItem('no-workspaces', 'No workspace folder open');
            noWorkspacesItem.setIconPath(new vscode_1.ThemeIcon("warning"));
            noWorkspacesItem.setTooltip("Please open a workspace folder to manage certificates");
            return [
                noWorkspacesItem
            ];
        }
        // Determine children based on element type
        childrenGuard: {
            if (element === undefined) {
                children = await this.getRootTreeItems();
                break childrenGuard;
            }
            if (element.type === "workspaces") {
                children = await this.getWorkspacesTreeItems(folders);
                break childrenGuard;
            }
            if (element.type === "workspace") {
                children = await this.getWorkspaceTreeItems(element);
                break childrenGuard;
            }
            // if (element.type === "workspace-configuration") {
            //   children = await this.getCertificateAuthorities(element);
            //   break childrenGuard;
            // }
            // if (element.type === "certificate-authority") {
            //   children = await this.getCertificates(element);
            //   break childrenGuard;
            // }
        }
        return children;
    }
    /**
     * Gets actions related to workspace certificate configuration files.
     *
     */
    async getRootTreeItems() {
        const items = [];
        // Group: Workspaces
        const workspacesTreeItem = new TypedTreeItem_1.TypedTreeItem('workspaces', 'Workspaces', vscode_1.TreeItemCollapsibleState.Collapsed);
        items.push(workspacesTreeItem);
        const hasAtleastOneWorkspaceConfigurationFile = await (async () => {
            const folders = vscode_1.workspace.workspaceFolders ?? [];
            for (const workspaceFolder of folders) {
                const configFileUri = vscode_1.Uri.joinPath(workspaceFolder.uri, ".certificates.json");
                try {
                    await vscode_1.workspace.fs.stat(configFileUri);
                    return true;
                }
                catch {
                    // File does not exist (or is inaccessible) in this folder; keep checking.
                }
            }
            return false;
        })();
        // Action: Refresh Configuration
        if (hasAtleastOneWorkspaceConfigurationFile === true) {
            const refreshConfigurationTreeItem = new ActionTreeItem_1.ActionTreeItem("refresh-configuration-files", "Refresh Configuration Files");
            refreshConfigurationTreeItem.setCommand({
                command: 'certificate-manager.loadConfigurationFiles',
                title: "Refresh Certificate Configurations",
            });
            refreshConfigurationTreeItem.setIconPath(new vscode_1.ThemeIcon("refresh"));
            items.push(refreshConfigurationTreeItem);
        }
        // Action: Open Documentation
        const openDocumentationTreeItem = new ActionTreeItem_1.ActionTreeItem("open-documentation", "Read Documentation");
        openDocumentationTreeItem.setCommand({
            command: 'certificate-manager.openDocumentation',
            title: "Open Certificate Manager Documentation",
        });
        openDocumentationTreeItem.setIconPath(new vscode_1.ThemeIcon("book"));
        items.push(openDocumentationTreeItem);
        // Return the assembled items
        return items;
    }
    /**
     * Gets a list of certificate configuration files from workspace folders.
     *
     * This method checks each workspace folder for a ".certificates.json" file.
     * If found, it creates a ConfigurationTreeItem. If not found, it
     * creates an EmptyTreeItem prompting the user to create one.
     *
     * @param workspaceFolders The workspace folders to check.
     * @returns A list of SidebarTreeItems representing the configuration files.
     */
    async getWorkspacesTreeItems(workspaceFolders) {
        return workspaceFolders.map((folder) => {
            const configFileUri = vscode_1.Uri.joinPath(folder.uri, ".certificates.json");
            const sidebarConfiguration = vscode_1.workspace.getConfiguration("@tw050x.net/certificate-manager.sidebar", folder.uri);
            const workspaceFolderNameDepth = sidebarConfiguration.get("workspaceFolderNameDepth") ?? 1;
            // Check if the configuration file exists
            // If it does, return a ConfigurationTreeItem
            // If not, return an EmptyTreeItem prompting to create one
            const label = configFileUri.fsPath.split("/").slice(0, -1).slice(-workspaceFolderNameDepth).join("/");
            const workspaceTreeItem = new WorkspaceTreeItem_1.WorkspaceTreeItem('workspace', label, vscode_1.TreeItemCollapsibleState.Collapsed);
            workspaceTreeItem.setUri(folder.uri);
            return workspaceTreeItem;
        });
    }
    /**
     * Gets tree items for a specific workspace.
     *
     */
    async getWorkspaceTreeItems(element) {
        // Guard: Ensure URI is defined
        if (element.uri === undefined) {
            return [
                new EmptyTreeItem_1.EmptyTreeItem('error', 'An error occurred while loading this workspace')
            ];
        }
        let children = [];
        //
        const configFileUri = vscode_1.Uri.joinPath(element.uri, ".certificates.json");
        try {
            await vscode_1.workspace.fs.stat(configFileUri);
            // Action: Open Create Certificate Authority Form
            const openCreateCertificateAuthorityTreeItem = new ActionTreeItem_1.ActionTreeItem("create-certificate-authority", "Create Certificate Authority");
            openCreateCertificateAuthorityTreeItem.setCommand({
                command: 'certificate-manager.openCreateCertificateAuthorityForm',
                title: "Create Certificate Authority",
            });
            openCreateCertificateAuthorityTreeItem.setIconPath(new vscode_1.ThemeIcon("file-add"));
            children.push(openCreateCertificateAuthorityTreeItem);
            // Action: Open Configuration File
            const openConfigurationTreeItem = new ActionTreeItem_1.ActionTreeItem("open-configuration-file", "Open Configuration File");
            openConfigurationTreeItem.setCommand({
                arguments: [element],
                command: 'certificate-manager.openConfigurationFile',
                title: "Open Certificate Configuration File",
            });
            openConfigurationTreeItem.setIconPath(new vscode_1.ThemeIcon("json"));
            children.push(openConfigurationTreeItem);
            // Action: Load Configuration File
            const refreshConfigurationTreeItem = new ActionTreeItem_1.ActionTreeItem("load-configuration-file", "Refresh Configuration File");
            refreshConfigurationTreeItem.setCommand({
                arguments: [element],
                command: 'certificate-manager.loadConfigurationFile',
                title: "Refresh Configuration File",
            });
            refreshConfigurationTreeItem.setIconPath(new vscode_1.ThemeIcon("refresh"));
            children.push(refreshConfigurationTreeItem);
        }
        catch {
            const createConfigurationTreeItem = new ActionTreeItem_1.ActionTreeItem("create-configuration-file", "Create Configuration File");
            createConfigurationTreeItem.setCommand({
                command: 'certificate-manager.createConfigurationFile',
                title: "Create Certificate Configuration File",
            });
            children.push(createConfigurationTreeItem);
        }
        return children;
    }
}
exports.default = SidebarTreeDataProvider;
//# sourceMappingURL=SidebarTreeDataProvider.js.map