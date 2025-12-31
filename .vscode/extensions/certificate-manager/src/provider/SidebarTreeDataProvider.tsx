import { EventEmitter, ThemeIcon, TreeDataProvider, TreeItemCollapsibleState, Uri, WorkspaceFolder, workspace } from "vscode";
import { ActionTreeItem } from "./SidebarTreeItem/ActionTreeItem";
import { EmptyTreeItem } from "./SidebarTreeItem/EmptyTreeItem";
import { TypedTreeItem } from "./SidebarTreeItem/TypedTreeItem";
import { WorkspaceTreeItem } from "./SidebarTreeItem/WorkspaceTreeItem";

type SidebarTreeItem =
  | ActionTreeItem<"create-configuration-file">
  | ActionTreeItem<"create-certificate-authority">
  | ActionTreeItem<"load-configuration-file">
  | ActionTreeItem<"open-configuration-file">
  | ActionTreeItem<"open-documentation">
  | ActionTreeItem<"refresh-configuration-files">
  | EmptyTreeItem<"error">
  | EmptyTreeItem<"no-workspaces">
  | TypedTreeItem<"workspaces">
  | WorkspaceTreeItem<"workspace">
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

    const items: Array<SidebarTreeItem> = [];

    // Group: Workspaces
    const workspacesTreeItem = new TypedTreeItem<"workspaces">('workspaces', 'Workspaces', TreeItemCollapsibleState.Collapsed);
    items.push(workspacesTreeItem);

    const hasAtleastOneWorkspaceConfigurationFile = await (async () => {
      const folders = workspace.workspaceFolders ?? [];
      for (const workspaceFolder of folders) {
        const configFileUri = Uri.joinPath(workspaceFolder.uri, ".certificates.json");
        try {
          await workspace.fs.stat(configFileUri);
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
      const refreshConfigurationTreeItem = new ActionTreeItem<"refresh-configuration-files">("refresh-configuration-files", "Refresh Configuration Files");
      refreshConfigurationTreeItem.setCommand({
        command: 'certificate-manager.loadConfigurationFiles',
        title: "Refresh Certificate Configurations",
      });
      refreshConfigurationTreeItem.setIconPath(new ThemeIcon("refresh"));
      items.push(refreshConfigurationTreeItem);
    }

    // Action: Open Documentation
    const openDocumentationTreeItem = new ActionTreeItem<"open-documentation">("open-documentation", "Read Documentation");
    openDocumentationTreeItem.setCommand({
      command: 'certificate-manager.openDocumentation',
      title: "Open Certificate Manager Documentation",
    });
    openDocumentationTreeItem.setIconPath(new ThemeIcon("book"));
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
      const workspaceTreeItem = new WorkspaceTreeItem('workspace', label, TreeItemCollapsibleState.Collapsed);
      workspaceTreeItem.setUri(folder.uri)
      return workspaceTreeItem;
    })
  }

  /**
   * Gets tree items for a specific workspace.
   *
   */
  async getWorkspaceTreeItems(element: WorkspaceTreeItem<"workspace">): Promise<Array<SidebarTreeItem>> {

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

      // Action: Open Create Certificate Authority Form
      const openCreateCertificateAuthorityTreeItem = new ActionTreeItem<"create-certificate-authority">(
        "create-certificate-authority",
        "Create Certificate Authority"
      );
      openCreateCertificateAuthorityTreeItem.setCommand({
        arguments: [element],
        command: 'certificate-manager.openCreateCertificateAuthorityForm',
        title: "Create Certificate Authority",
      });
      openCreateCertificateAuthorityTreeItem.setIconPath(new ThemeIcon("file-add"));
      children.push(openCreateCertificateAuthorityTreeItem);

      // Action: Open Configuration File
      const openConfigurationTreeItem = new ActionTreeItem<"open-configuration-file">(
        "open-configuration-file",
        "Open Configuration File"
      );
      openConfigurationTreeItem.setCommand({
        arguments: [element],
        command: 'certificate-manager.openConfigurationFile',
        title: "Open Certificate Configuration File",
      });
      openConfigurationTreeItem.setIconPath(new ThemeIcon("json"));
      children.push(openConfigurationTreeItem);

      // Action: Load Configuration File
      const refreshConfigurationTreeItem = new ActionTreeItem<"load-configuration-file">(
        "load-configuration-file",
        "Refresh Configuration File"
      );
      refreshConfigurationTreeItem.setCommand({
        arguments: [element],
        command: 'certificate-manager.loadConfigurationFile',
        title: "Refresh Configuration File",
      });
      refreshConfigurationTreeItem.setIconPath(new ThemeIcon("refresh"));
      children.push(refreshConfigurationTreeItem);
    }
    catch {
      const createConfigurationTreeItem = new ActionTreeItem<"create-configuration-file">(
        "create-configuration-file",
        "Create Configuration File"
      );
      createConfigurationTreeItem.setCommand({
        command: 'certificate-manager.createConfigurationFile',
        title: "Create Certificate Configuration File",
      });
      children.push(createConfigurationTreeItem);
    }

    return children;
  }
}

export default SidebarTreeDataProvider;
