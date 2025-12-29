import { ExtensionContext, ViewColumn, commands, window } from "vscode";
import { CreateCertificateAuthorityForm } from "../component/CreateCertificateAuthorityForm";

/**
 *
 */
export const commandsId = "certificate-manager.openCreateCertificateAuthorityForm";

/**
 *
 */
async function openCreateCertificateAuthorityForm(): Promise<void> {
  const panel = window.createWebviewPanel(
    'certificateAuthorityForm',
    'Certificate Authority Form',
    ViewColumn.Active
  );

  panel.webview.html = await <CreateCertificateAuthorityForm />;
}

/**
 * Registers the certificate-manager.openCreateCertificateAuthorityForm command.
 *
 */
export function registerOpenCreateCertificateAuthorityFormCommand(context: ExtensionContext): void {
  const handler = async () => {
    openCreateCertificateAuthorityForm();
  }

  context.subscriptions.push(
    commands.registerCommand(commandsId, handler)
  );
}
