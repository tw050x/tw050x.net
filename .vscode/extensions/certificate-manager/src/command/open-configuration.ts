import { ExtensionContext, Uri, WorkspaceFolder, commands, window, workspace } from "vscode";

/**
 *
 */
export const commandId = "certificate-manager.openConfiguration";

/**
 * Opens a .certificates.json file in the given workspace folder.
 *
 * @param folder
 * @returns
 */
async function openConfigurationFile(workspaceFolder: WorkspaceFolder): Promise<void> {
  const document = await workspace.openTextDocument(Uri.joinPath(workspaceFolder.uri, ".certificates.json"));
  await window.showTextDocument(document);
}

/**
 * Registers the openConfiguration command.
 *
 * @param options
 * @returns
 */
export function registerOpenConfigurationCommand(context: ExtensionContext) {
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
    await openConfigurationFile(workspaceFolder);
  }

  context.subscriptions.push(
    commands.registerCommand(commandId, handler)
  );
}
