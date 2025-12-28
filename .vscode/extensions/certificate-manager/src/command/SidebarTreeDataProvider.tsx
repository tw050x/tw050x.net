import { EventEmitter, ThemeIcon, TreeDataProvider, TreeItemCollapsibleState, Uri, WorkspaceFolder, workspace } from "vscode";
import { commandId as createConfigurationCommandId } from "../command/create-configuration";
import { commandId as loadConfigurationsCommandId } from "../command/load-configurations";
import { commandId as openConfigurationCommandId } from "../command/open-configuration";
import { commandId as openDocumentationCommandId } from "../command/open-documentation";
import { ActionTreeItem } from "./SidebarTreeItem/ActionTreeItem";
import { DirectoryTreeItem } from "./SidebarTreeItem/DirectoryTreeItem";
import { EmptyTreeItem } from "./SidebarTreeItem/EmptyTreeItem";
import { TypedTreeItem } from "./SidebarTreeItem/TypedTreeItem";

type SidebarTreeItem =
  | ActionTreeItem<"create-configuration-file">
  | ActionTreeItem<"open-configuration-file">
  | ActionTreeItem<"open-documentation">
  | ActionTreeItem<"refresh-configuration-files">
  | DirectoryTreeItem<"workspace">
  | EmptyTreeItem<"error">
  | EmptyTreeItem<"no-workspaces">
  | TypedTreeItem<"workspaces">
  ;

/**
 * SidebarTreeDataProvider for the Certificate Authorities view.
 */
class SidebarTreeDataProvider implements TreeDataProvider<SidebarTreeItem> {

  /**
   * Emitter for tree data changes.
   */
  private readonly changeEmitter = new EventEmitter<SidebarTreeItem | void>();

  /**
   * Event fired when the tree data changes.
   */
  readonly onDidChangeTreeData = this.changeEmitter.event;

  /**
   * Refresh the tree view.
   */
  refresh(): void {
    this.changeEmitter.fire();
  }

  /**
   * Get the tree item for the given element.
   *
   * @param element
   * @returns
   */
  getTreeItem(element: SidebarTreeItem) {
    return element;
  }

  /**
   * Get the children for the given element.
   *
   * @param element
   */
  async getChildren(element?: SidebarTreeItem): Promise<Array<SidebarTreeItem>> {
    let children: Array<SidebarTreeItem> = [];

    // Check for workspace folders
    const folders = workspace.workspaceFolders ?? [];
    missingWorkspaceGuard: {
      if (folders.length > 0) {
        break missingWorkspaceGuard;
      }

      const noWorkspacesItem = new EmptyTreeItem('no-workspaces', 'No workspace folder open');
      noWorkspacesItem.setIconPath(new ThemeIcon("warning"));
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
  async getRootTreeItems(): Promise<Array<SidebarTreeItem>> {

    // Group: Workspaces
    const workspacesTreeItem = new TypedTreeItem<"workspaces">('workspaces', 'Workspaces', TreeItemCollapsibleState.Collapsed);

    // Action: Refresh Configuration
    const refreshConfigurationTreeItem = new ActionTreeItem<"refresh-configuration-files">("refresh-configuration-files", "Refresh Configuration Files");
    refreshConfigurationTreeItem.setCommand({
      command: loadConfigurationsCommandId,
      title: "Refresh Certificate Configurations",
    });
    refreshConfigurationTreeItem.setIconPath(new ThemeIcon("refresh"));

    // Action: Open Documentation
    const openDocumentationTreeItem = new ActionTreeItem<"open-documentation">("open-documentation", "Read Documentation");
    openDocumentationTreeItem.setCommand({
      command: openDocumentationCommandId,
      title: "Open Certificate Manager Documentation",
    });
    openDocumentationTreeItem.setIconPath(new ThemeIcon("book"));

    return [
      workspacesTreeItem,
      refreshConfigurationTreeItem,
      openDocumentationTreeItem,
    ]
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
  async getWorkspacesTreeItems(workspaceFolders: ReadonlyArray<WorkspaceFolder>): Promise<Array<SidebarTreeItem>> {
    return workspaceFolders.map((folder) => {
      const configFileUri = Uri.joinPath(folder.uri, ".certificates.json");

      const sidebarConfiguration = workspace.getConfiguration(
        "@tw050x.net/certificate-manager.sidebar",
        folder.uri
      )
      const workspaceFolderNameDepth = sidebarConfiguration.get<number>("workspaceFolderNameDepth") ?? 1;

      // Check if the configuration file exists
      // If it does, return a ConfigurationTreeItem
      // If not, return an EmptyTreeItem prompting to create one
      const label = configFileUri.fsPath.split("/").slice(0, -1).slice(-workspaceFolderNameDepth).join("/")
      const workspaceTreeItem = new DirectoryTreeItem('workspace', label, TreeItemCollapsibleState.Collapsed);
      workspaceTreeItem.setUri(folder.uri)
      return workspaceTreeItem;
    })
  }

  /**
   * Gets tree items for a specific workspace.
   *
   */
  async getWorkspaceTreeItems(element: DirectoryTreeItem<"workspace">): Promise<Array<SidebarTreeItem>> {

    // Guard: Ensure URI is defined
    if (element.uri === undefined) {
      return [
        new EmptyTreeItem('error', 'An error occurred while loading this workspace')
      ]
    }

    let children: Array<SidebarTreeItem> = [];

    //
    const configFileUri = Uri.joinPath(element.uri, ".certificates.json");
    try {
      await workspace.fs.stat(configFileUri);
      const openConfigurationTreeItem = new ActionTreeItem<"open-configuration-file">("open-configuration-file", "Open Configuration File");
      openConfigurationTreeItem.setCommand({
        arguments: [element.uri],
        command: openConfigurationCommandId,
        title: "Open Certificate Configuration File",
      });
      openConfigurationTreeItem.setIconPath(new ThemeIcon("json"));
      children.push(openConfigurationTreeItem);
    }
    catch {
      const createConfigurationTreeItem = new ActionTreeItem<"create-configuration-file">("create-configuration-file", "Create Configuration File");
      createConfigurationTreeItem.setCommand({
        command: createConfigurationCommandId,
        title: "Create Certificate Configuration File",
      });
      children.push(createConfigurationTreeItem);
    }

    return children;
  }
}

export default SidebarTreeDataProvider;
