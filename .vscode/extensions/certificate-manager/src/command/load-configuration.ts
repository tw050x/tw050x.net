import { ExtensionContext, Uri, WorkspaceFolder, commands, window, workspace } from "vscode";
import { Configuration, configurations } from "../cache";

/**
 *
 */
export const commandId = "certificate-manager.loadConfiguration";

/**
 * Loads .certificates.json config files from all workspace folders.
 */
async function loadConfiguration(workspaceFolder: WorkspaceFolder): Promise<void> {
  configurations.delete(workspaceFolder.uri.fsPath);

  const configFileUri = Uri.joinPath(workspaceFolder.uri, ".certificates.json");
  const configFilePath = configFileUri.fsPath;

  let loadedCount = 0;
  // if file does not exist, return
  try {
    await workspace.fs.stat(configFileUri);
  }
  catch {
    return void window.showWarningMessage(
      `No configuration file found at ${configFilePath}.`
    );
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
    return void window.showWarningMessage(
      `Could not read configuration file at ${configFilePath}. Reason: ${error}`
    );
  }

  window.showInformationMessage(
    `Certificate Manager loaded the configuration file.`
  );
}

/**
 * Registers the load configurations command.
 */
export function registerLoadConfigurationCommand(context: ExtensionContext): void {
  const handler = async (workspaceFolder?: WorkspaceFolder) => {
    if (workspaceFolder === undefined) {
      const folder = await window.showWorkspaceFolderPick({
        placeHolder: "Select a workspace folder to open .certificates.json",
      });

      if (folder === undefined) {
        return;
      }

      workspaceFolder = folder;
    }
    await loadConfiguration(workspaceFolder);
  };

  context.subscriptions.push(
    commands.registerCommand(commandId, handler)
  );
}
