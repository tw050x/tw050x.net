import { ExtensionContext } from "vscode";
import { commands } from "vscode";

/**
 *
 */
export const commandId = "certificate-manager.openDocumentation";

/**
 * Opens the documentation file in the specified workspace folder.
 *
 * @returns
 */
async function openDocumentationFile(): Promise<void> {
  console.log("Open documentation file in folder:");
}

/**
 * Registers the createConfig command.
 *
 * @param options
 * @returns
 */
export function registerOpenDocumentationCommand(context: ExtensionContext) {
  const handler = async () => {
    await openDocumentationFile();
  }

  context.subscriptions.push(
    commands.registerCommand(commandId, handler)
  );
}
