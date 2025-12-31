"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateAuthorityForm = void 0;
const jsx_runtime_1 = require("@kitajs/html/jsx-runtime");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
/**
 * Safe CSS styles for CertificateAuthorityForm component
 */
const styles = (0, node_fs_1.readFileSync)((0, node_path_1.resolve)(__dirname, "..", "..", "static", "style.css"), "utf8");
/**
 * The `<CertificateAuthorityForm />` component renders a form for creating or editing a Certificate Authority.
 *
 */
const CertificateAuthorityForm = (props) => {
    const formDefaultValues = props.formDefaultValues;
    const formInitialValues = props.formInitialValues;
    const safeStyles = styles; // rename variables for type system
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ['<!doctype html>', (0, jsx_runtime_1.jsxs)("html", { children: [(0, jsx_runtime_1.jsxs)("head", { children: [(0, jsx_runtime_1.jsx)("meta", { charset: "UTF-8" }), (0, jsx_runtime_1.jsx)("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }), (0, jsx_runtime_1.jsx)("style", { children: safeStyles }), (0, jsx_runtime_1.jsx)("style", { children: `
              form label[for="storagePath"]::after,
              form label[for="certificateCommonName"]::after {
                content: " *";
                color: var(--vscode-errorForeground);
              }

              form label[for="storageUseDefaultLocation"] {
                justify-self: start;
                text-align: left;
              }
            ` })] }), (0, jsx_runtime_1.jsxs)("body", { children: [(0, jsx_runtime_1.jsx)("h1", { children: "Create Certificate Authority" }), (0, jsx_runtime_1.jsx)("hr", {}), (0, jsx_runtime_1.jsxs)("form", { id: "certificateAuthorityForm", children: [(0, jsx_runtime_1.jsxs)("fieldset", { children: [(0, jsx_runtime_1.jsx)("legend", { children: "Storage" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("input", { id: "storageUseDefaultLocation", type: "checkbox", name: "storageUseDefaultLocation", "data-default-checked": String(formDefaultValues?.storageUseDefaultLocation === true), "data-initial-checked": String(formInitialValues?.storageUseDefaultLocation === true) }), (0, jsx_runtime_1.jsx)("label", { for: "storageUseDefaultLocation", children: "Use default location" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { for: "storagePath", children: "Path" }), (0, jsx_runtime_1.jsx)("input", { id: "storagePath", type: "text", name: "storagePath", "data-default-value": formDefaultValues?.storagePath ?? '', "data-initial-value": formInitialValues?.storagePath ?? '' })] })] }), (0, jsx_runtime_1.jsxs)("fieldset", { children: [(0, jsx_runtime_1.jsx)("legend", { children: "Certificate" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { for: "certificateCommonName", children: "Common Name" }), (0, jsx_runtime_1.jsx)("input", { id: "certificateCommonName", type: "text", name: "certificateCommonName", "data-default-value": formDefaultValues?.certificateCommonName ?? '', "data-initial-value": formInitialValues?.certificateCommonName ?? '' })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { for: "certificateOrganization", children: "Organization" }), (0, jsx_runtime_1.jsx)("input", { id: "certificateOrganization", type: "text", name: "certificateOrganization", "data-default-value": formDefaultValues?.certificateOrganization ?? '', "data-initial-value": formInitialValues?.certificateOrganization ?? '' })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { for: "certificateOrganizationalUnit", children: "Organizational Unit" }), (0, jsx_runtime_1.jsx)("input", { id: "certificateOrganizationalUnit", type: "text", name: "certificateOrganizationalUnit", "data-default-value": formDefaultValues?.certificateOrganizationalUnit ?? '', "data-initial-value": formInitialValues?.certificateOrganizationalUnit ?? '' })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { for: "certificateLocality", children: "Locality / City" }), (0, jsx_runtime_1.jsx)("input", { id: "certificateLocality", type: "text", name: "certificateLocality", "data-default-value": formDefaultValues?.certificateLocality ?? '', "data-initial-value": formInitialValues?.certificateLocality ?? '' })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { for: "certificateStateOrProvince", children: "State / Province" }), (0, jsx_runtime_1.jsx)("input", { id: "certificateStateOrProvince", type: "text", name: "certificateStateOrProvince", "data-default-value": formDefaultValues?.certificateStateOrProvince ?? '', "data-initial-value": formInitialValues?.certificateStateOrProvince ?? '' })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { for: "certificateCountry", children: "Country" }), (0, jsx_runtime_1.jsx)("input", { id: "certificateCountry", type: "text", name: "certificateCountry", "data-default-value": formDefaultValues?.certificateCountry ?? '', "data-initial-value": formInitialValues?.certificateCountry ?? '', maxlength: "2" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { for: "certificateEmailAddress", children: "Email" }), (0, jsx_runtime_1.jsx)("input", { id: "certificateEmailAddress", type: "email", name: "certificateEmailAddress", "data-default-value": formDefaultValues?.certificateEmailAddress ?? '', "data-initial-value": formInitialValues?.certificateEmailAddress ?? '' })] })] })] }), (0, jsx_runtime_1.jsxs)("aside", { role: "group", "aria-label": "Form actions", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", "data-action": "reset", children: "Reset" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", form: "certificateAuthorityForm", children: "Submit" })] }), (0, jsx_runtime_1.jsx)("script", { children: `
              const vscode = (typeof acquireVsCodeApi === 'function') ? acquireVsCodeApi() : undefined;
              const form = document.getElementById('certificateAuthorityForm');
              const checkbox = document.getElementById('storageUseDefaultLocation');
              const storagePathInput = document.getElementById('storagePath');
              const resetButton = document.querySelector('aside button[data-action="reset"]');

              if (form instanceof HTMLFormElement && checkbox instanceof HTMLInputElement && storagePathInput instanceof HTMLInputElement) {
                // Ensure form.reset() restores INITIAL values
                for (const element of Array.from(form.elements)) {
                  if (!(element instanceof HTMLElement)) {
                    continue;
                  }

                  if (element instanceof HTMLInputElement) {
                    if (element.type === 'checkbox') {
                      const initialChecked = element.dataset.initialChecked;
                      if (initialChecked !== undefined) {
                        element.defaultChecked = initialChecked === 'true';
                        element.checked = initialChecked === 'true';
                      }
                      continue;
                    }

                    const initialValue = element.dataset.initialValue;
                    if (initialValue !== undefined) {
                      element.defaultValue = initialValue;
                      element.value = initialValue;
                    }
                    continue;
                  }

                  if (element instanceof HTMLTextAreaElement) {
                    const initialValue = element.dataset.initialValue;
                    if (initialValue !== undefined) {
                      element.defaultValue = initialValue;
                      element.value = initialValue;
                    }
                    continue;
                  }

                  if (element instanceof HTMLSelectElement) {
                    // Future-proofing: if needed, can add data-default-value/data-initial-value handling.
                    continue;
                  }
                }

                const defaultStoragePath = storagePathInput.dataset.defaultValue ?? '';
                let previousManualStoragePath = '';
                let hasPreviousManualStoragePath = false;

                const sync = () => {
                  if (checkbox.checked === true) {
                    if (hasPreviousManualStoragePath === false) {
                      previousManualStoragePath = storagePathInput.value;
                      hasPreviousManualStoragePath = true;
                    }
                    storagePathInput.value = defaultStoragePath;
                    storagePathInput.disabled = true;
                    return;
                  }

                  storagePathInput.disabled = false;
                  if (hasPreviousManualStoragePath === true) {
                    storagePathInput.value = previousManualStoragePath;
                    hasPreviousManualStoragePath = false;
                  }
                };

                checkbox.addEventListener('change', sync);
                sync();

                if (resetButton instanceof HTMLButtonElement) {
                  resetButton.addEventListener('click', () => {
                    return void vscode?.postMessage({ type: 'confirmResetInitial' });
                  });
                }

                window.addEventListener('message', (event) => {
                  const msg = event && event.data;
                  if (!msg || msg.type !== 'confirmResetInitialResult') {
                    return;
                  }
                  if (msg.ok !== true) {
                    return;
                  }
                  previousManualStoragePath = '';
                  hasPreviousManualStoragePath = false;
                  form.reset();
                  sync();
                });
              }
            ` })] })] })] }));
};
exports.CertificateAuthorityForm = CertificateAuthorityForm;
//# sourceMappingURL=CertificateAuthorityForm.js.map