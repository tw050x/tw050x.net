import { ExtensionContext, commands, window, workspace } from "vscode";
import { registerCreateConfigurationCommand } from "./command/create-configuration";
import { registerLoadConfigurationCommand } from "./command/load-configuration";
import { commandId as loadConfigurationsCommandId, registerLoadConfigurationsCommand } from "./command/load-configurations";
import { registerOpenCreateCertificateAuthorityFormCommand } from "./command/open-create-certificate-authority-form";
import { registerOpenConfigurationCommand } from "./command/open-configuration";
import { registerOpenDocumentationCommand } from "./command/open-documentation";
import { default as SidebarTreeDataProvider } from "./provider/SidebarTreeDataProvider";

/**
 * Activate the extension.
 *
 * @param context
 */
async function activate(context: ExtensionContext) {
  const sidebarTreeDataProvider = new SidebarTreeDataProvider();

  context.subscriptions.push(
    window.registerTreeDataProvider('certificate-manager--sidebar', sidebarTreeDataProvider)
  );

  const refreshSidebarTreeDataProvider = () => {
    sidebarTreeDataProvider.refresh();
  }

  context.subscriptions.push(
    workspace.onDidChangeWorkspaceFolders(() => {
      refreshSidebarTreeDataProvider();
    })
  );

  // Fallback: refresh when the document is saved (covers cases where FS events are coalesced or missed)
  const fileSystemWatcher = workspace.createFileSystemWatcher("**/.certificates.json");
  fileSystemWatcher.onDidChange(refreshSidebarTreeDataProvider);
  fileSystemWatcher.onDidCreate(refreshSidebarTreeDataProvider);
  fileSystemWatcher.onDidDelete(refreshSidebarTreeDataProvider);
  context.subscriptions.push(fileSystemWatcher);

  // Watch for changes to any certificate files in the workspace
  context.subscriptions.push(
    workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("@tw050x.net/certificate-manager.sidebar")) {
        refreshSidebarTreeDataProvider();
      }
    })
  );

  // Register commands
  registerCreateConfigurationCommand(context, sidebarTreeDataProvider);
  registerLoadConfigurationCommand(context);
  registerLoadConfigurationsCommand(context);
  registerOpenCreateCertificateAuthorityFormCommand(context);
  registerOpenConfigurationCommand(context);
  registerOpenDocumentationCommand(context);

  // Initial load of configurations
  await commands.executeCommand(loadConfigurationsCommandId);
}

/**
 * Deactivate the extension.
 *
 */
function deactivate() {
  console.log("Certificate extension deactivated");
}

export { activate, deactivate };
