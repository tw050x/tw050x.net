"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const create_configuration_1 = require("../command/create-configuration");
const open_configuration_1 = require("../command/open-configuration");
const open_documentation_1 = require("../command/open-documentation");
const ActionTreeItem_1 = require("./SidebarTreeItem/ActionTreeItem");
const DirectoryTreeItem_1 = require("./SidebarTreeItem/DirectoryTreeItem");
const EmptyTreeItem_1 = require("./SidebarTreeItem/EmptyTreeItem");
const TypedTreeItem_1 = require("./SidebarTreeItem/TypedTreeItem");
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
        // Group: Workspaces
        const workspacesTreeItem = new TypedTreeItem_1.TypedTreeItem('workspaces', 'Workspaces', vscode_1.TreeItemCollapsibleState.Collapsed);
        // Action: Open Documentation
        const openDocumentationTreeItem = new ActionTreeItem_1.ActionTreeItem("open-documentation", "Read Documentation");
        openDocumentationTreeItem.setCommand({
            command: open_documentation_1.commandId,
            title: "Open Certificate Manager Documentation",
        });
        openDocumentationTreeItem.setIconPath(new vscode_1.ThemeIcon("book"));
        return [
            workspacesTreeItem,
            openDocumentationTreeItem,
        ];
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
            const workspaceTreeItem = new DirectoryTreeItem_1.DirectoryTreeItem('workspace', label, vscode_1.TreeItemCollapsibleState.Collapsed);
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
            const openConfigurationTreeItem = new ActionTreeItem_1.ActionTreeItem("open-configuration-file", "Open Configuration File");
            openConfigurationTreeItem.setCommand({
                arguments: [element.uri],
                command: open_configuration_1.commandId,
                title: "Open Certificate Configuration File",
            });
            openConfigurationTreeItem.setIconPath(new vscode_1.ThemeIcon("json"));
            children.push(openConfigurationTreeItem);
        }
        catch {
            const createConfigurationTreeItem = new ActionTreeItem_1.ActionTreeItem("create-configuration-file", "Create Configuration File");
            createConfigurationTreeItem.setCommand({
                command: create_configuration_1.commandId,
                title: "Create Certificate Configuration File",
            });
            children.push(createConfigurationTreeItem);
        }
        return children;
    }
}
exports.default = SidebarTreeDataProvider;
//# sourceMappingURL=SidebarTreeDataProvider.js.map