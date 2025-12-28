import { ExtensionContext, Uri, commands, window, workspace } from "vscode";
import { Configuration, configurations } from "../cache";

/**
 *
 */
export const commandId = "certificate-manager.loadConfigurations";

/**
 * Loads .certificates.json config files from all workspace folders.
 */
async function loadConfigurations(): Promise<void> {
  if (workspace.workspaceFolders === undefined || workspace.workspaceFolders.length === 0) {
    return void window.showWarningMessage(
      "No workspace folder is open. Certificate Manager cannot load configuration."
    );
  }

  configurations.clear();

  let loadedCount = 0;

  for (const folder of workspace.workspaceFolders) {
    const configFileUri = Uri.joinPath(folder.uri, ".certificates.json");
    const configFilePath = configFileUri.fsPath;

    // if file does not exist, skip iteration
    try {
      await workspace.fs.stat(configFileUri);
    }
    catch {
      continue;
    }

    // read and parse configuration file
    try {
      const fileData = await workspace.fs.readFile(configFileUri);
      const fileContent = Buffer.from(fileData).toString("utf8");
      const config = JSON.parse(fileContent) as Configuration;
      loadedCount++;
      configurations.set(configFilePath, config);
    }
    catch (error) {
      window.showWarningMessage(`Could not read configuration file at ${configFilePath}. Reason: ${error}`);
      continue;
    }
  }

  if (loadedCount === 0) {
    return void window.showWarningMessage("No configuration files were found in the workspace folders.");
  }

  window.showInformationMessage(`Certificate Manager loaded ${loadedCount} configuration file(s).`);
}

/**
 * Registers the load configurations command.
 */
export function registerLoadConfigurationsCommand(context: ExtensionContext): void {
  const handler = async () => {
    await loadConfigurations();
  };

  context.subscriptions.push(
    commands.registerCommand(commandId, handler)
  );
}
