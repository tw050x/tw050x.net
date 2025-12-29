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
    const panel = vscode_1.window.createWebviewPanel('certificateAuthorityForm', 'Certificate Authority Form', vscode_1.ViewColumn.Active);
    panel.webview.html = await (0, jsx_runtime_1.jsx)(CreateCertificateAuthorityForm_1.CreateCertificateAuthorityForm, {});
}
/**
 *
 */
function registerOpenCreateCertificateAuthorityFormCommand(context) {
    const handler = async () => {
        openCreateCertificateAuthorityForm();
    };
    context.subscriptions.push(vscode_1.commands.registerCommand(exports.commandsId, handler));
}
//# sourceMappingURL=open-certificate-authority-form.js.map