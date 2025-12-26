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
async function openConfigurationFile(uri: Uri): Promise<void> {
  const document = await workspace.openTextDocument(Uri.joinPath(uri, ".certificates.json"));
  await window.showTextDocument(document);
}

/**
 * Registers the openConfiguration command.
 *
 * @param options
 * @returns
 */
export function registerOpenConfigurationCommand(context: ExtensionContext) {
  const handler = async (uri?: Uri) => {
    if (uri === undefined) {
      const folder = await window.showWorkspaceFolderPick({
        placeHolder: "Select a workspace folder to open .certificates.json",
      });

      if (!folder) {
        return;
      }

      uri = folder.uri;
    }
    await openConfigurationFile(uri);
  }

  context.subscriptions.push(
    commands.registerCommand(commandId, handler)
  );
}
