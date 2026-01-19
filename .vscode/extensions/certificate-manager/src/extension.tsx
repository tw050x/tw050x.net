import { ConfigurationChangeEvent, ExtensionContext, Uri, ViewColumn, WebviewPanel, WorkspaceFolder, commands, window, workspace } from "vscode";
import { homedir } from "node:os";
import { randomUUID } from "node:crypto";
import { CertificateAuthorityForm, Props as CertificateAuthorityFormProps } from "./component/CertificateAuthorityForm";
import { default as SidebarTreeDataProvider } from "./provider/SidebarTreeDataProvider";
import { Configuration, configurations } from "./cache";
import { default as pkg } from "../package.json";

/**
 * Activate the extension.
 *
 * @param context
 */
async function activate(context: ExtensionContext) {


  // Helper to get default storage path
  const getConfiguredStorageDirectoryPath = (): string => {
    const config = workspace.getConfiguration('@tw050x.net/certificate-manager');
    const configuredPath = config.get<string | null>('storage.directoryPath');
    if (configuredPath !== null && configuredPath !== undefined && configuredPath.trim() !== '') {
      return configuredPath;
    }
    return Uri.joinPath(Uri.file(homedir()), '.certificates').fsPath;
  }

  // Helper to get default certificate settings
  const getConfiguredCertificateKeySize = (): number => {
    const config = workspace.getConfiguration('@tw050x.net/certificate-manager');
    const configuredKeySize = config.get<number>('certificate.keySize');
    return configuredKeySize ?? pkg.contributes.configuration.properties['@tw050x.net/certificate-manager.certificate.keySize'].default;
  }

  // Helper to get default certificate settings
  const getConfiguredCertificateValidityDays = (): number => {
    const config = workspace.getConfiguration('@tw050x.net/certificate-manager');
    const configuredValidityDays = config.get<number>('certificate.validityDays');
    return configuredValidityDays ?? pkg.contributes.configuration.properties['@tw050x.net/certificate-manager.certificate.validityDays'].default;
  }

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
  let openCertificateAuthorityFormWebviewPanel: WebviewPanel | undefined = undefined;
  const clearOpenCertificateAuthorityFormWebviewPanel = () => {
    openCertificateAuthorityFormWebviewPanel = undefined;
  }
  type CertificateAuthorityMessage =
    | { type: 'confirmResetInitial' }
    | { type: 'confirmResetInitialResult'; ok: boolean }
    | { type: 'certificateAuthorityFormValidationResult'; fieldErrors: Record<string, string[]> };

  type CertificateAuthorityFormSubmitPayload = {
    certificateCommonName: string;
    certificateCountry: string;
    certificateEmailAddress: string;
    certificateKeySize: number | null;
    certificateKeySizeUseDefault: boolean;
    certificateLocality: string;
    certificateOrganization: string;
    certificateOrganizationalUnit: string;
    certificateStateOrProvince: string;
    certificateValidityDays: number | null;
    certificateValidityDaysUseDefault: boolean;
    storageDirectoryPathUseDefault: boolean;
    storageDirectoryPath: string;
    uuid: string;
    workspaceFolderUri: string;
  };

  type CertificateAuthorityFormSubmitMessage = {
    type: 'submitCertificateAuthorityForm';
    payload: CertificateAuthorityFormSubmitPayload;
  };

  type CertificateAuthorityConfigurationCertificateSubjectRecord = {
    commonName?: string;
    country?: string;
    emailAddress?: string;
    locality?: string;
    organization?: string;
    organizationalUnit?: string;
    stateOrProvince?: string;
  }

  type CertificateAuthorityConfigurationCertificateConfigurationRecord = {
    keySize?: number;
  }

  type CertificateAuthorityConfigurationCertificateValidityRecord = {
    validityDays?: number;
  }

  type CertificateAuthorityConfiguration = {
    'certificateSubject'?: CertificateAuthorityConfigurationCertificateSubjectRecord;
    'certificateConfiguration'?: CertificateAuthorityConfigurationCertificateConfigurationRecord;
    'certificateValidity'?: CertificateAuthorityConfigurationCertificateValidityRecord;
    storage?: Record<string, unknown>;
  };

  type CertificatesConfigurationFile = {
    authorities?: Record<string, CertificateAuthorityConfiguration>;
  };

  const parseJsonObject = (text: string): Record<string, unknown> => {
    const parsed: unknown = JSON.parse(text);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Expected JSON object at root.');
    }
    return parsed as Record<string, unknown>;
  }

  const setIfNonEmptyString = (target: Record<string, unknown>, key: string, value: string) => {
    const trimmed = value.trim();
    if (trimmed !== '') {
      target[key] = trimmed;
    }
  }

  const setIfNumber = (target: Record<string, unknown>, key: string, value: number | null) => {
    if (value !== null && Number.isFinite(value)) {
      target[key] = value;
    }
  }

  const isNonEmptyObject = (value: Record<string, unknown>): boolean => {
    return Object.keys(value).length > 0;
  }

  const upsertCertificateAuthorityInConfiguration = (
    configuration: CertificatesConfigurationFile,
    payload: CertificateAuthorityFormSubmitPayload
  ): CertificatesConfigurationFile => {
    const next: CertificatesConfigurationFile = { ...configuration };

    const authoritiesRaw = next.authorities;
    const authorities: Record<string, unknown> = (
      authoritiesRaw !== undefined && authoritiesRaw !== null && typeof authoritiesRaw === 'object' && !Array.isArray(authoritiesRaw)
        ? (authoritiesRaw as Record<string, unknown>)
        : {}
    );

    const authorityEntry: Record<string, unknown> = {};

    // certificate-subject
    const certificateSubject: Record<string, unknown> = {};
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
    const certificateConfiguration: Record<string, unknown> = {};
    if (payload.certificateKeySizeUseDefault === false) {
      setIfNumber(certificateConfiguration, 'keySize', payload.certificateKeySize);
    }
    if (isNonEmptyObject(certificateConfiguration)) {
      authorityEntry['certificateConfiguration'] = certificateConfiguration;
    }

    // certificate-validity
    const certificateValidity: Record<string, unknown> = {};
    if (payload.certificateValidityDaysUseDefault === false) {
      setIfNumber(certificateValidity, 'days', payload.certificateValidityDays);
    }
    if (isNonEmptyObject(certificateValidity)) {
      authorityEntry['certificateValidity'] = certificateValidity;
    }

    // storage
    const storage: Record<string, unknown> = {};
    if (payload.storageDirectoryPathUseDefault === false) {
      setIfNonEmptyString(storage, 'directoryPath', payload.storageDirectoryPath);
    }
    if (isNonEmptyObject(storage)) {
      authorityEntry['storage'] = storage;
    }

    authorities[payload.uuid] = authorityEntry;
    next.authorities = authorities;
    return next;
  }

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

  // Helper to read configuration file
  const readConfigurationFile = async (configFileUri: Uri): Promise<CertificatesConfigurationFile> => {
    const fileData = await workspace.fs.readFile(configFileUri);
    const fileContent = Buffer.from(fileData).toString("utf8");
    return JSON.parse(fileContent) as CertificatesConfigurationFile;
  }

  // Handler for messages from Certificate Authority Form webview
  const openCertificateAuthorityFormMessageHandler = async (message?: CertificateAuthorityMessage | CertificateAuthorityFormSubmitMessage) => {
    if (message === undefined) {
      return void window.showInformationMessage(
        'No message received from Certificate Authority Form webview.'
      );
    }

    if (message.type === 'submitCertificateAuthorityForm') {
      window.setStatusBarMessage('Saving Certificate Authority…', 2000);
      try {
        const selectedWorkspaceFolderUri = message.payload.workspaceFolderUri.trim();

        const workspaceFolder = workspace.getWorkspaceFolder(Uri.parse(selectedWorkspaceFolderUri));
        if (workspaceFolder === undefined) {
          return void window.showWarningMessage(
            'Selected workspace folder is not available. Cannot save Certificate Authority.'
          );
        }

        const configFileUri = createConfigurationFileUri(workspaceFolder);
        let existing: CertificatesConfigurationFile = {};
        try {
          const raw = await workspace.fs.readFile(configFileUri);
          const text = Buffer.from(raw).toString('utf8');
          existing = parseJsonObject(text) as CertificatesConfigurationFile;
        }
        catch {
          // Missing or unreadable config file; create fresh.
          existing = {};
        }

        const updated = upsertCertificateAuthorityInConfiguration(existing, message.payload);
        const nextContent = JSON.stringify(updated, null, 2) + '\n';
        await workspace.fs.writeFile(configFileUri, Buffer.from(nextContent, 'utf8'));
        await openCertificateAuthorityFormWebviewPanel?.webview.postMessage({
          type: 'certificateAuthorityFormValidationResult',
          fieldErrors: {},
        } satisfies CertificateAuthorityMessage);
        refreshSidebarTreeDataProvider();
        return void window.showInformationMessage(
          'Certificate Authority saved to .certificates.json.'
        );
      }
      catch (error) {
        await openCertificateAuthorityFormWebviewPanel?.webview.postMessage({
          type: 'certificateAuthorityFormValidationResult',
          fieldErrors: {},
        } satisfies CertificateAuthorityMessage);
        return void window.showErrorMessage(
          `Failed to save Certificate Authority: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    if (message.type === 'confirmResetInitial') {
      const selection = await window.showWarningMessage(
        'Reset all fields to their initial values?',
        { modal: true },
        'Reset'
      );
      const ok = selection === 'Reset';
      return void await openCertificateAuthorityFormWebviewPanel?.webview.postMessage({
        type: 'confirmResetInitialResult',
        ok,
      } satisfies CertificateAuthorityMessage);
    }
  }
  const openCertificateAuthorityFormHandler = async (
    workspaceFolder: WorkspaceFolder,
    certificateAuthorityUUID?: string,
  ) => {
    if (openCertificateAuthorityFormWebviewPanel === undefined) {
      const viewType = 'certificateAuthorityForm';
      const title = 'Certificate Authority Form';
      const showOptions = ViewColumn.Active;
      const options = {
        enableScripts: true,
      };
      openCertificateAuthorityFormWebviewPanel = window.createWebviewPanel(
        viewType,
        title,
        showOptions,
        options
      );
      openCertificateAuthorityFormWebviewPanel.webview.onDidReceiveMessage(openCertificateAuthorityFormMessageHandler);
      openCertificateAuthorityFormWebviewPanel.onDidDispose(clearOpenCertificateAuthorityFormWebviewPanel);
    }

    const configuredCertificateKeySize = getConfiguredCertificateKeySize();
    const configuredCertificateValidityDays = getConfiguredCertificateValidityDays();
    const configuredStorageDirectoryPath = getConfiguredStorageDirectoryPath();

    const formInitialValues: Partial<CertificateAuthorityFormProps['formInitialValues']> = {};
    if (certificateAuthorityUUID !== undefined) {
      const configFileUri = createConfigurationFileUri(workspaceFolder);
      const configuration = await readConfigurationFile(configFileUri);
      formInitialValues['certificateCommonName'] = configuration.authorities?.[certificateAuthorityUUID]?.certificateSubject?.commonName
      formInitialValues['uuid'] = certificateAuthorityUUID;
    }

    openCertificateAuthorityFormWebviewPanel.webview.html = await (
      <CertificateAuthorityForm
        formSelectionOptions={{
          workspaceFolders: (workspace.workspaceFolders ?? []).map((folder) => ({
            uri: folder.uri.toString(),
            name: folder.name,
          })),
        }}
        formDefaultValues={{
          certificateKeySize: configuredCertificateKeySize,
          certificateValidityDays: configuredCertificateValidityDays,
          storageDirectoryPath: configuredStorageDirectoryPath,
        }}
        formInitialValues={{
          certificateCommonName: '',
          certificateCountry: '',
          certificateEmailAddress: '',
          certificateKeySize: configuredCertificateKeySize,
          certificateKeySizeUseDefault: true,
          certificateValidityDays: configuredCertificateValidityDays,
          certificateValidityDaysUseDefault: true,
          storageDirectoryPathUseDefault: true,
          storageDirectoryPath: configuredStorageDirectoryPath,
          uuid: certificateAuthorityUUID ?? randomUUID(),
          workspaceFolderUri: workspaceFolder.uri.toString(),
        }}
      />
    );

    if (openCertificateAuthorityFormWebviewPanel.visible === false) {
      openCertificateAuthorityFormWebviewPanel.reveal(ViewColumn.Active);
    }
  }
  const openCertificateAuthorityFormDisposable = commands.registerCommand(
    'certificate-manager.openCertificateAuthorityForm',
    ensureWorkspaceFolderParameter(openCertificateAuthorityFormHandler)
  )
  context.subscriptions.push(openCertificateAuthorityFormDisposable);

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
    await commands.executeCommand('markdown.showPreview', documentationUri);
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
}

export { activate, deactivate };
