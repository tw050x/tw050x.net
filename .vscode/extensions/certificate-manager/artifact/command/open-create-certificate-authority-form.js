"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandsId = void 0;
exports.registerOpenCreateCertificateAuthorityFormCommand = registerOpenCreateCertificateAuthorityFormCommand;
const jsx_runtime_1 = require("@kitajs/html/jsx-runtime");
const vscode_1 = require("vscode");
const CreateCertificateAuthorityForm_1 = require("../component/CreateCertificateAuthorityForm");
/**
 *
 */
exports.commandsId = "certificate-manager.openCreateCertificateAuthorityForm";
/**
 *
 */
async function openCreateCertificateAuthorityForm() {
    // TODO: move to a class so that the panel can be stored in a central locations to avoid multiple being created.
    const panel = vscode_1.window.createWebviewPanel('certificateAuthorityForm', 'Certificate Authority Form', vscode_1.ViewColumn.Active);
    panel.webview.html = await (0, jsx_runtime_1.jsx)(CreateCertificateAuthorityForm_1.CreateCertificateAuthorityForm, {});
}
/**
 * Registers the certificate-manager.openCreateCertificateAuthorityForm command.
 *
 */
function registerOpenCreateCertificateAuthorityFormCommand(context) {
    const handler = async () => {
        openCreateCertificateAuthorityForm();
    };
    context.subscriptions.push(vscode_1.commands.registerCommand(exports.commandsId, handler));
}
//# sourceMappingURL=open-create-certificate-authority-form.js.map