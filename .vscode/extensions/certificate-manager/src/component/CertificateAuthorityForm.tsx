import { Component } from "@kitajs/html";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Safe CSS styles for CertificateAuthorityForm component
 */
const styles = readFileSync(
  resolve(__dirname, "..", "..", "static", "style.css"),
  "utf8"
);

/**
 * Props for CertificateAuthorityForm component
 */
type Props = {
  formDefaultValues?: {
    storageDirectoryPath?: string;
  }
  formInitialValues?: {
    certificateCommonName?: string;
    certificateCountry?: string;
    certificateStateOrProvince?: string;
    certificateLocality?: string;
    certificateOrganization?: string;
    certificateOrganizationalUnit?: string;
    certificateEmailAddress?: string;
    storageUseDefaultLocation?: boolean;
    storageDirectoryPath?: string;
  };
};

/**
 * The `<CertificateAuthorityForm />` component renders a form for creating or editing a Certificate Authority.
 *
 */
export const CertificateAuthorityForm: Component<Props> = (props) => {
  const formDefaultValues = props.formDefaultValues;
  const formInitialValues = props.formInitialValues;
  const safeStyles = styles; // rename variables for type system
  return (
    <>
      {'<!doctype html>'}
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            {safeStyles}
          </style>

          <style>
            {`
              form label[for="storageDirectoryPath"]::after,
              form label[for="certificateCommonName"]::after {
                content: " *";
                color: var(--vscode-errorForeground);
              }

              form label[for="storageUseDefaultLocation"] {
                justify-self: start;
                text-align: left;
              }
            `}
          </style>
        </head>
        <body>
          <h1>Create Certificate Authority</h1>
          <hr />
          <form id="certificateAuthorityForm">
            <fieldset>
              <legend>Storage</legend>
              <div>
                <label for="storageDirectoryPath">Directory Path</label>
                <input
                  id="storageDirectoryPath"
                  type="text"
                  name="storageDirectoryPath"
                  value={formInitialValues?.storageDirectoryPath ?? formDefaultValues?.storageDirectoryPath ?? ''}
                  data-default-value={formDefaultValues?.storageDirectoryPath ?? ''}
                  data-initial-value={formInitialValues?.storageDirectoryPath ?? ''}
                />
              </div>

              <div>
                <input
                  id="storageUseDefaultLocation"
                  type="checkbox"
                  name="storageUseDefaultLocation"
                  checked={formInitialValues?.storageUseDefaultLocation === true}
                  data-initial-checked={String(formInitialValues?.storageUseDefaultLocation === true)}
                />
                <label for="storageUseDefaultLocation">Use default location</label>
              </div>
            </fieldset>

            <fieldset>
              <legend>Certificate</legend>
              <div>
                <label for="certificateCommonName">Common Name</label>
                <input
                  id="certificateCommonName"
                  type="text"
                  name="certificateCommonName"
                  data-initial-value={formInitialValues?.certificateCommonName ?? ''}
                />
              </div>

              <div>
                <label for="certificateOrganization">Organization</label>
                <input
                  id="certificateOrganization"
                  type="text"
                  name="certificateOrganization"
                  data-initial-value={formInitialValues?.certificateOrganization ?? ''}
                />
              </div>

              <div>
                <label for="certificateOrganizationalUnit">Organizational Unit</label>
                <input
                  id="certificateOrganizationalUnit"
                  type="text"
                  name="certificateOrganizationalUnit"
                  data-initial-value={formInitialValues?.certificateOrganizationalUnit ?? ''}
                />
              </div>

              <div>
                <label for="certificateLocality">Locality / City</label>
                <input
                  id="certificateLocality"
                  type="text"
                  name="certificateLocality"
                  data-initial-value={formInitialValues?.certificateLocality ?? ''}
                />
              </div>

              <div>
                <label for="certificateStateOrProvince">State / Province</label>
                <input
                  id="certificateStateOrProvince"
                  type="text"
                  name="certificateStateOrProvince"
                  data-initial-value={formInitialValues?.certificateStateOrProvince ?? ''}
                />
              </div>

              <div>
                <label for="certificateCountry">Country</label>
                <input
                  id="certificateCountry"
                  type="text"
                  name="certificateCountry"
                  data-initial-value={formInitialValues?.certificateCountry ?? ''}
                  maxlength="2"
                />
              </div>

              <div>
                <label for="certificateEmailAddress">Email</label>
                <input
                  id="certificateEmailAddress"
                  type="email"
                  name="certificateEmailAddress"
                  data-initial-value={formInitialValues?.certificateEmailAddress ?? ''}
                />
              </div>
            </fieldset>
          </form>

          <aside role="group" aria-label="Form actions">
            <button type="button" data-action="reset">Reset</button>
            <button type="submit" form="certificateAuthorityForm">Submit</button>
          </aside>

          <script>
            {`
              const vscode = (typeof acquireVsCodeApi === 'function') ? acquireVsCodeApi() : undefined;
              const form = document.getElementById('certificateAuthorityForm');
              const checkbox = document.getElementById('storageUseDefaultLocation');
              const storageDirectoryPathInput = document.getElementById('storageDirectoryPath');
              const resetButton = document.querySelector('aside button[data-action="reset"]');

              const getInputValue = (id) => {
                const element = document.getElementById(id);
                if (element instanceof HTMLInputElement) {
                  return element.value;
                }
                return '';
              };

              if (form instanceof HTMLFormElement && checkbox instanceof HTMLInputElement && storageDirectoryPathInput instanceof HTMLInputElement) {
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

                const defaultStorageDirectoryPath = storageDirectoryPathInput.dataset.defaultValue ?? '';
                let previousManualStoragePath = '';
                let hasPreviousManualStoragePath = false;

                const sync = () => {
                  if (checkbox.checked === true) {
                    if (hasPreviousManualStoragePath === false) {
                      previousManualStoragePath = storageDirectoryPathInput.value;
                      hasPreviousManualStoragePath = true;
                    }
                    storageDirectoryPathInput.value = defaultStorageDirectoryPath;
                    storageDirectoryPathInput.disabled = true;
                    storageDirectoryPathInput.setAttribute('disabled', '');
                    return;
                  }

                  storageDirectoryPathInput.disabled = false;
                  storageDirectoryPathInput.removeAttribute('disabled');
                  if (hasPreviousManualStoragePath === true) {
                    storageDirectoryPathInput.value = previousManualStoragePath;
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

                form.addEventListener('submit', (event) => {
                  event.preventDefault();

                  const payload = {
                    storageUseDefaultLocation: checkbox.checked === true,
                    storageDirectoryPath: storageDirectoryPathInput.value,
                    certificateCommonName: getInputValue('certificateCommonName'),
                    certificateOrganization: getInputValue('certificateOrganization'),
                    certificateOrganizationalUnit: getInputValue('certificateOrganizationalUnit'),
                    certificateLocality: getInputValue('certificateLocality'),
                    certificateStateOrProvince: getInputValue('certificateStateOrProvince'),
                    certificateCountry: getInputValue('certificateCountry'),
                    certificateEmailAddress: getInputValue('certificateEmailAddress'),
                  };

                  vscode?.postMessage({ type: 'submitCertificateAuthorityForm', payload });
                });
              }
            `}
          </script>
        </body>
      </html>
    </>
  );
}
