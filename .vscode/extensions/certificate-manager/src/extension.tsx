import { ConfigurationChangeEvent, ExtensionContext, Uri, ViewColumn, WorkspaceFolder, commands, window, workspace } from "vscode";
import { CreateCertificateAuthorityForm } from "./component/CreateCertificateAuthorityForm";
import { default as SidebarTreeDataProvider } from "./provider/SidebarTreeDataProvider";
import { Configuration, configurations } from "./cache";

/**
 * Activate the extension.
 *
 * @param context
 */
async function activate(context: ExtensionContext) {

  // Setup Sidebar
  const sidebarTreeDataProvider = new SidebarTreeDataProvider();
  const sidebarDisposable = window.registerTreeDataProvider('certificate-manager--sidebar', sidebarTreeDataProvider)
  context.subscriptions.push(sidebarDisposable);

  // Watch for changes in the workspace to refresh the sidebar
  const refreshSidebarTreeDataProvider = () => {
    sidebarTreeDataProvider.refresh();
  }
  const workspaceFoldersChangeDisposable = workspace.onDidChangeWorkspaceFolders(refreshSidebarTreeDataProvider);
  context.subscriptions.push(workspaceFoldersChangeDisposable);

  // Watch for changes to .certificates.json files in the workspaces
  const fileSystemWatcher = workspace.createFileSystemWatcher('**/.certificates.json');
  const fileChangeDisposable = fileSystemWatcher.onDidChange(refreshSidebarTreeDataProvider);
  const fileCreateDisposable = fileSystemWatcher.onDidCreate(refreshSidebarTreeDataProvider);
  const fileDeleteDisposable = fileSystemWatcher.onDidDelete(refreshSidebarTreeDataProvider);
  context.subscriptions.push(fileChangeDisposable);
  context.subscriptions.push(fileCreateDisposable);
  context.subscriptions.push(fileDeleteDisposable);
  context.subscriptions.push(fileSystemWatcher);

  // Watch for changes to any certificate files in the workspace
  const onDidChangeConfiguration = (event: ConfigurationChangeEvent) => {
    if (event.affectsConfiguration('@tw050x.net/certificate-manager.sidebar')) {
      refreshSidebarTreeDataProvider();
    }
  }
  const configurationChangeDisposable = workspace.onDidChangeConfiguration(onDidChangeConfiguration)
  context.subscriptions.push(configurationChangeDisposable);

  // Register open create certificate authority form command
  const openCreateCertificateAuthorityFormHandler = async () => {
    const panel = window.createWebviewPanel(
      'certificateAuthorityForm',
      'Certificate Authority Form',
      ViewColumn.Active
    );
    panel.webview.html = await <CreateCertificateAuthorityForm />;
  }
  const openCreateCertificateAuthorityFormDisposable = commands.registerCommand('certificate-manager.openCreateCertificateAuthorityForm', openCreateCertificateAuthorityFormHandler)
  context.subscriptions.push(openCreateCertificateAuthorityFormDisposable);

  // Helper to ensure workspaceFolder parameter is provided to command handlers
  type WorkspaceFolderCommandHandler = (workspaceFolder?: WorkspaceFolder) => Promise<void>;
  const ensureWorkspaceFolderParameter = (handler: (workspaceFolder: WorkspaceFolder) => Promise<void>): WorkspaceFolderCommandHandler => {
    return async (workspaceFolder) => {
      if (workspaceFolder === undefined) {
        const folder = await window.showWorkspaceFolderPick({
          placeHolder: "Select a workspace folder to create .certificates.json",
        });
        if (folder === undefined) {
          return void window.showWarningMessage(
            "No workspace folder selected. Cannot create .certificates.json file."
          );
        }
        workspaceFolder = folder;
      }
      await handler(workspaceFolder);
    }
  }

  // Helper to create configuration file URI
  const createConfigurationFileUri = (workspaceFolder: WorkspaceFolder): Uri => {
    return Uri.joinPath(workspaceFolder.uri, ".certificates.json");
  }

  // Register create configuration file command
  const createConfigurationHandler = async (workspaceFolder: WorkspaceFolder) => {
    const configFileUri = createConfigurationFileUri(workspaceFolder);
    try {
      await workspace.fs.stat(configFileUri);
      const messageOptions = {
        modal: true,
        detail: "Creating a new configuration file will delete the existing one."
      };
      const overwrite = await window.showWarningMessage(
        `${workspaceFolder.uri.fsPath}/.certificates.json already exists.`,
        messageOptions,
        "Continue"
      );
      if (overwrite !== "Continue") {
        return void window.showInformationMessage(
          'Operation cancelled. Existing .certificates.json file was not overwritten.'
        );
      }
    }
    catch {
      // file does not exist (probably); continue
    }
    try {
      const defaultContent = JSON.stringify({}, null, 2) + "\n";
      await workspace.fs.writeFile(configFileUri, Buffer.from(defaultContent, "utf8"));
    }
    catch (error) {
      window.showErrorMessage(
        `Failed to create .certificates.json file: ${error instanceof Error ? error.message : String(error)}`
      );
    }
    refreshSidebarTreeDataProvider();
    const doc = await workspace.openTextDocument(configFileUri);
    await window.showTextDocument(doc);
  }
  const createConfigurationDisposable = commands.registerCommand(
    'certificate-manager.createConfigurationFile',
    ensureWorkspaceFolderParameter(createConfigurationHandler)
  );
  context.subscriptions.push(createConfigurationDisposable);

  // Helper to read configuration file
  const readConfigurationFile = async (configFileUri: Uri): Promise<Configuration> => {
    const fileData = await workspace.fs.readFile(configFileUri);
    const fileContent = Buffer.from(fileData).toString("utf8");
    return JSON.parse(fileContent) as Configuration;
  }

  // Register load configurations command
  const loadConfigurationHandler = async (workspaceFolder: WorkspaceFolder) => {
    const configFileUri = createConfigurationFileUri(workspaceFolder);
    try {
      await workspace.fs.stat(configFileUri);
    }
    catch {
      return void window.showErrorMessage(
        `No .certificates.json file found in workspace folder ${workspaceFolder.name}.`
      )
    }
    const configFilePath = configFileUri.fsPath;
    try {
      configurations.set(configFilePath, await readConfigurationFile(configFileUri));
    }
    catch (error) {
      return void window.showErrorMessage(
        `Failed to load the configuration from ${configFilePath}. Reason: ${error instanceof Error ? error.message : String(error)}`
      );
    }
    window.showInformationMessage(
      `Loaded the configuration file from workspace folder ${workspaceFolder.name}.`
    );
  }
  const loadConfigurationDisposable = commands.registerCommand(
    'certificate-manager.loadConfigurationFile',
    ensureWorkspaceFolderParameter(loadConfigurationHandler)
  );
  context.subscriptions.push(loadConfigurationDisposable);

  // Helper to ensure workspaceFolders parameter is provided to command handlers
  type WorkspaceFoldersCommandHandler = (workspaceFolders?: ReadonlyArray<WorkspaceFolder>) => Promise<void>;
  const ensureWorkspaceFoldersParameter = (handler: (workspaceFolders: ReadonlyArray<WorkspaceFolder>) => Promise<void>): WorkspaceFoldersCommandHandler => {
    return async (workspaceFolders) => {
      if (workspaceFolders === undefined) {
        workspaceFolders = workspace.workspaceFolders || ([] as ReadonlyArray<WorkspaceFolder>);
      }
      await handler(workspaceFolders);
    }
  }

  // Register load configurations command
  const loadConfigurationsHandler = async (workspaceFolders: ReadonlyArray<WorkspaceFolder>) => {
    let loadedCount = 0;
    for (const workspaceFolder of workspaceFolders) {
      const configFileUri = createConfigurationFileUri(workspaceFolder);
      try {
        await workspace.fs.stat(configFileUri);
      }
      catch {
        continue;
      }
      const configFilePath = configFileUri.fsPath;
      try {
        configurations.set(configFilePath, await readConfigurationFile(configFileUri));
        loadedCount++;
      }
      catch (error) {
        continue;
      }
    }
    if (loadedCount === 0) {
      window.showWarningMessage(
        "No configuration files were found in the workspace folders."
      );
    }
    else {
      window.showInformationMessage(
        `Certificate Manager loaded ${loadedCount} configuration file(s).`
      );
    }
  }
  const loadConfigurationsDisposable = commands.registerCommand(
    'certificate-manager.loadConfigurationFiles',
    ensureWorkspaceFoldersParameter(loadConfigurationsHandler)
  );
  context.subscriptions.push(loadConfigurationsDisposable);

  // Register open configuration command
  const openConfigurationFileCommandHandler = async (workspaceFolder: WorkspaceFolder) => {
    const configFileUri = createConfigurationFileUri(workspaceFolder);
    const document = await workspace.openTextDocument(configFileUri);
    await window.showTextDocument(document);
  }
  const openConfigurationDisposable = commands.registerCommand(
    'certificate-manager.openConfigurationFile',
    ensureWorkspaceFolderParameter(openConfigurationFileCommandHandler)
  );
  context.subscriptions.push(openConfigurationDisposable);

  // Helper to create documentation file URI
  const createDocumentationFileUri = (): Uri => {
    return Uri.joinPath(context.extensionUri, "documentation", "getting-started.md");
  }

  // Register open documentation command
  const openDocumentationHandler = async () => {
    const documentationUri = createDocumentationFileUri();
    await commands.executeCommand('markdown.showPreviewToSide', documentationUri);
  }
  const openDocumentationDisposable = commands.registerCommand(
    'certificate-manager.openDocumentation',
    openDocumentationHandler
  );
  context.subscriptions.push(openDocumentationDisposable);

  // Initial load of configurations
  await commands.executeCommand('certificate-manager.loadConfigurationFiles');
}

/**
 * Deactivate the extension.
 *
 */
function deactivate() {
  console.log('Certificate extension deactivated');
}

export { activate, deactivate };
