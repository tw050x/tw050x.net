import { ExtensionContext, Uri, WorkspaceFolder, commands, window, workspace } from "vscode";
import { commandId as loadConfigurationsCommandId } from "./load-configurations";
import { type default as SidebarTreeDataProvider } from "../provider/SidebarTreeDataProvider";

/**
 *
 */
export const commandId = "certificate-manager.createConfiguration";

/**
 * Creates a .certificates.json file in the given workspace folder.
 *
 * @param folder
 * @returns
 */
async function createConfigurationFile(folder: WorkspaceFolder): Promise<void> {
  const configFileUri = Uri.joinPath(folder.uri, ".certificates.json");

  try {
    await workspace.fs.stat(configFileUri);

    const overwrite = await window.showWarningMessage(
      `${folder.uri.fsPath}/.certificates.json already exists.`,
      { modal: true, detail: "Creating a new configuration file will overwrite the existing one." },
      "Overwrite"
    );

    if (overwrite !== "Overwrite") {
      return;
    }
  }
  catch {
    // file does not exist; continue
  }

  const defaultContent = JSON.stringify({}, null, 2) + "\n";
  await workspace.fs.writeFile(configFileUri, Buffer.from(defaultContent, "utf8"));
}

/**
 * Registers the createConfig command.
 *
 * @param options
 * @returns
 */
export function registerCreateConfigurationCommand(context: ExtensionContext, sidebarTreeDataProvider: SidebarTreeDataProvider) {
  const handler = async () => {
    const folder = await window.showWorkspaceFolderPick({
      placeHolder: "Select a workspace folder to create .certificates.json",
    });

    if (!folder) {
      return;
    }

    await createConfigurationFile(folder);

    sidebarTreeDataProvider.refresh();
    await commands.executeCommand(loadConfigurationsCommandId);

    const doc = await workspace.openTextDocument(Uri.joinPath(folder.uri, ".certificates.json"));
    await window.showTextDocument(doc);
  }

  context.subscriptions.push(
    commands.registerCommand(commandId, handler)
  );
}
