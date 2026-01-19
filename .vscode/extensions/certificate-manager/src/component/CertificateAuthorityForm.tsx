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
export type Props = {
  form: {
    fieldset: {
      workspace: {
        folders: Array<{
          uri: string;
          name: string;
        }>;
      }
      certificateSubject: {
        commonName: string;
        organization: string;
        organizationalUnit: string;
        locality: string;
        stateOrProvince: string;
        country: string;
        emailAddress: string;
      }
      certificateConfiguration: {
        keySize: number;
      }
      certificateValidity: {
        days: number;
      }
      storage: {
        directoryPath: string;
      }
    }
  }
  formSelectionOptions?: {
    workspaceFolders?: Array<{
      uri: string;
      name: string;
    }>;
  };
  formDefaultValues?: {
    certificateValidityDays?: number;
    certificateKeySize?: number;
    storageDirectoryPath?: string;
  }
  formInitialValues?: {
    certificateCommonName?: string;
    certificateCountry?: string;
    certificateEmailAddress?: string;
    certificateKeySize?: number;
    certificateKeySizeUseDefault?: boolean;
    certificateLocality?: string;
    certificateOrganization?: string;
    certificateOrganizationalUnit?: string;
    certificateStateOrProvince?: string;
    certificateValidityDays?: number;
    certificateValidityDaysUseDefault?: boolean;
    storageDirectoryPathUseDefault?: boolean;
    storageDirectoryPath?: string;
    uuid?: string;
    workspaceFolderUri?: string;
  };
};

/**
 * The `<CertificateAuthorityForm />` component renders a form for creating or editing a Certificate Authority.
 *
 */
export const CertificateAuthorityForm: Component<Props> = (props) => {
  const formDefaultValues = props.formDefaultValues;
  const formInitialValues = props.formInitialValues;
  const workspaceFolders = props.formSelectionOptions?.workspaceFolders ?? [];
  const workspaceFolderUris = workspaceFolders.map((folder) => folder.uri);
  const safeStyles = styles; // rename variables for type system
  return (
    <>
      {'<!doctype html>'}
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            {safeStyles}
          </style>

          <style>
            {`
              form label[for="storageDirectoryPath"]::after,
              form label[for="certificateCommonName"]::after,
              form label[for="certificateValidityDays"]::after,
              form label[for="certificateKeySize"]::after {
                content: " *";
                color: var(--vscode-errorForeground);
              }

              form input[data-invalid="true"],
              form select[data-invalid="true"],
              form textarea[data-invalid="true"] {
                outline: 1px solid var(--vscode-inputValidation-errorBorder);
                outline-offset: 1px;
                border-color: var(--vscode-inputValidation-errorBorder);
              }

              form label[for="storageDirectoryPathUseDefault"],
              form label[for="certificateValidityDaysUseDefault"],
              form label[for="certificateKeySizeUseDefault"] {
                justify-self: start;
                text-align: left;
                -webkit-user-select: none;
                user-select: none;
              }
            `}
          </style>
        </head>
        <body>
          <h1>Create Certificate Authority</h1>
          <hr />
          <form id="certificateAuthorityForm">
            <fieldset>
              <legend>Workspace</legend>
              <div>
                <label for="workspaceFolderUri">Workspace Folder</label>
                <select
                  id="workspaceFolderUri"
                  name="workspaceFolderUri"
                  data-initial-value={formInitialValues?.workspaceFolderUri ?? ''}
                >
                  {workspaceFolders.length > 1 ? (
                    <option value="">Select a workspace folder…</option>
                  ) : null}
                  {workspaceFolders.map((folder) => (
                    <option safe value={folder.uri}>{folder.name}</option>
                  ))}
                </select>
              </div>
            </fieldset>

            <input
              id="uuid"
              type="hidden"
              name="uuid"
              value={formInitialValues?.uuid ?? ''}
              data-initial-value={formInitialValues?.uuid ?? ''}
            />

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
                  id="storageDirectoryPathUseDefault"
                  type="checkbox"
                  name="storageDirectoryPathUseDefault"
                  checked={formInitialValues?.storageDirectoryPathUseDefault === true}
                  data-initial-checked={String(formInitialValues?.storageDirectoryPathUseDefault === true)}
                />
                <label for="storageDirectoryPathUseDefault">Use default directory path</label>
              </div>
            </fieldset>

            <fieldset>
              <legend>Certificate Subject</legend>
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

            <fieldset>
              <legend>Certificate Configuration</legend>
              <div>
                <label for="certificateKeySize">Key Size</label>
                <input
                  id="certificateKeySize"
                  type="text"
                  name="certificateKeySize"
                  data-default-value={formDefaultValues?.certificateKeySize !== undefined ? String(formDefaultValues.certificateKeySize) : undefined}
                  data-initial-value={formInitialValues?.certificateKeySize !== undefined ? String(formInitialValues.certificateKeySize) : ''}
                />
              </div>

              <div>
                <input
                  id="certificateKeySizeUseDefault"
                  type="checkbox"
                  name="certificateKeySizeUseDefault"
                  checked={formInitialValues?.certificateKeySizeUseDefault === true}
                  data-initial-checked={String(formInitialValues?.certificateKeySizeUseDefault === true)}
                />
                <label for="certificateKeySizeUseDefault">Use default key size</label>
              </div>
            </fieldset>

            <fieldset>
              <legend>Certificate Validity</legend>
              <div>
                <label for="certificateValidityDays">Validity Days</label>
                <input
                  id="certificateValidityDays"
                  type="text"
                  name="certificateValidityDays"
                  data-default-value={formDefaultValues?.certificateValidityDays !== undefined ? String(formDefaultValues.certificateValidityDays) : undefined}
                  data-initial-value={formInitialValues?.certificateValidityDays !== undefined ? String(formInitialValues.certificateValidityDays) : ''}
                />
              </div>

              <div>
                <input
                  id="certificateValidityDaysUseDefault"
                  type="checkbox"
                  name="certificateValidityDaysUseDefault"
                  checked={formInitialValues?.certificateValidityDaysUseDefault === true}
                  data-initial-checked={String(formInitialValues?.certificateValidityDaysUseDefault === true)}
                />
                <label for="certificateValidityDaysUseDefault">Use default validity days</label>
              </div>
            </fieldset>
          </form>

          <aside role="group" aria-label="Form actions">
            <button type="button" data-action="reset">Reset</button>
            <button type="button" data-action="submit">Submit</button>
          </aside>

          <script>
            {`
              const WORKSPACE_FOLDER_URIS = ${JSON.stringify(workspaceFolderUris)};

              const vscode = (typeof acquireVsCodeApi === 'function') ? acquireVsCodeApi() : undefined;
              const form = document.getElementById('certificateAuthorityForm');
              const workspaceFolderUriSelect = document.getElementById('workspaceFolderUri');
              const checkbox = document.getElementById('storageDirectoryPathUseDefault');
              const storageDirectoryPathInput = document.getElementById('storageDirectoryPath');
              const certificateValidityDaysUseDefaultCheckbox = document.getElementById('certificateValidityDaysUseDefault');
              const certificateValidityDaysInput = document.getElementById('certificateValidityDays');
              const certificateKeySizeUseDefaultCheckbox = document.getElementById('certificateKeySizeUseDefault');
              const certificateKeySizeInput = document.getElementById('certificateKeySize');
              const resetButton = document.querySelector('button[data-action="reset"]');
              const submitButton = document.querySelector('button[data-action="submit"]');

              const getFieldValue = (id) => {
                const element = document.getElementById(id);
                if (element instanceof HTMLInputElement) {
                  return element.value;
                }
                if (element instanceof HTMLSelectElement) {
                  return element.value;
                }
                if (element instanceof HTMLTextAreaElement) {
                  return element.value;
                }
                return '';
              };

              const getIntValue = (id) => {
                const value = getFieldValue(id).trim();
                if (value === '') {
                  return null;
                }
                const parsed = Number.parseInt(value, 10);
                return Number.isFinite(parsed) ? parsed : null;
              };

              const getChecked = (id) => {
                const element = document.getElementById(id);
                return (element instanceof HTMLInputElement && element.type === 'checkbox')
                  ? element.checked === true
                  : false;
              };

              const clearValidation = () => {
                if (!(form instanceof HTMLFormElement)) {
                  return;
                }
                const invalidElements = form.querySelectorAll('[data-invalid="true"]');
                for (const element of Array.from(invalidElements)) {
                  if (!(element instanceof HTMLElement)) {
                    continue;
                  }
                  element.removeAttribute('data-invalid');
                  element.removeAttribute('aria-invalid');
                  element.removeAttribute('title');
                }
              };

              const applyValidation = (fieldErrors) => {
                clearValidation();
                if (!fieldErrors || typeof fieldErrors !== 'object') {
                  return;
                }
                for (const key of Object.keys(fieldErrors)) {
                  const messages = fieldErrors[key];
                  if (!Array.isArray(messages) || messages.length === 0) {
                    continue;
                  }
                  const element = document.getElementById(key);
                  if (
                    element instanceof HTMLInputElement ||
                    element instanceof HTMLSelectElement ||
                    element instanceof HTMLTextAreaElement
                  ) {
                    element.setAttribute('data-invalid', 'true');
                    element.setAttribute('aria-invalid', 'true');
                    element.setAttribute('title', messages.join('\n'));
                  }
                }
              };

              const isNonEmptyString = (value) => {
                return typeof value === 'string' && value.trim() !== '';
              };

              const validateCertificateAuthorityPayload = (payload) => {
                const summary = [];
                const fieldErrors = {};

                const addFieldError = (fieldId, message) => {
                  summary.push(message);
                  const existing = fieldErrors[fieldId];
                  if (existing === undefined) {
                    fieldErrors[fieldId] = [message];
                    return;
                  }
                  existing.push(message);
                };

                if (!isNonEmptyString(payload.workspaceFolderUri)) {
                  addFieldError('workspaceFolderUri', 'Workspace folder is required.');
                } else if (Array.isArray(WORKSPACE_FOLDER_URIS) && WORKSPACE_FOLDER_URIS.length > 0) {
                  if (!WORKSPACE_FOLDER_URIS.includes(payload.workspaceFolderUri)) {
                    addFieldError('workspaceFolderUri', 'Selected workspace folder is not available.');
                  }
                }

                if (!isNonEmptyString(payload.uuid)) {
                  summary.push('UUID is required.');
                }

                if (!isNonEmptyString(payload.certificateCommonName)) {
                  addFieldError('certificateCommonName', 'Certificate Subject: Common Name is required.');
                }

                if (payload.storageDirectoryPathUseDefault === false) {
                  if (!isNonEmptyString(payload.storageDirectoryPath)) {
                    addFieldError('storageDirectoryPath', 'Storage: Directory Path is required (or select “Use default directory path”).');
                  }
                }

                if (payload.certificateKeySizeUseDefault === false) {
                  if (payload.certificateKeySize === null) {
                    addFieldError('certificateKeySize', 'Certificate Configuration: Key Size is required (or select “Use default key size”).');
                  } else if (!Number.isInteger(payload.certificateKeySize) || payload.certificateKeySize <= 0) {
                    addFieldError('certificateKeySize', 'Certificate Configuration: Key Size must be a positive integer.');
                  }
                }

                if (payload.certificateValidityDaysUseDefault === false) {
                  if (payload.certificateValidityDays === null) {
                    addFieldError('certificateValidityDays', 'Certificate Validity: Validity Days is required (or select “Use default validity days”).');
                  } else if (!Number.isInteger(payload.certificateValidityDays) || payload.certificateValidityDays <= 0) {
                    addFieldError('certificateValidityDays', 'Certificate Validity: Validity Days must be a positive integer.');
                  }
                }

                const country = String(payload.certificateCountry ?? '').trim();
                if (country !== '' && country.length !== 2) {
                  addFieldError('certificateCountry', 'Certificate Subject: Country should be a 2-letter code.');
                }

                const email = String(payload.certificateEmailAddress ?? '').trim();
                if (email !== '' && !email.includes('@')) {
                  addFieldError('certificateEmailAddress', 'Certificate Subject: Email address is not valid.');
                }

                return { summary, fieldErrors };
              };

              const submitForm = () => {
                console.log('1');
                clearValidation();
                console.log('2');

                if (vscode === undefined) {
                  return;
                }
                console.log('3');

                const trim = (value) => String(value ?? '').trim();
                console.log('4');

                const payload = {
                  workspaceFolderUri: trim(getFieldValue('workspaceFolderUri')),
                  certificateCommonName: trim(getFieldValue('certificateCommonName')),
                  certificateOrganization: trim(getFieldValue('certificateOrganization')),
                  certificateOrganizationalUnit: trim(getFieldValue('certificateOrganizationalUnit')),
                  certificateLocality: trim(getFieldValue('certificateLocality')),
                  certificateStateOrProvince: trim(getFieldValue('certificateStateOrProvince')),
                  certificateCountry: trim(getFieldValue('certificateCountry')),
                  certificateEmailAddress: trim(getFieldValue('certificateEmailAddress')),
                  certificateValidityDays: getIntValue('certificateValidityDays'),
                  certificateValidityDaysUseDefault: getChecked('certificateValidityDaysUseDefault'),
                  certificateKeySize: getIntValue('certificateKeySize'),
                  certificateKeySizeUseDefault: getChecked('certificateKeySizeUseDefault'),
                  storageDirectoryPathUseDefault: getChecked('storageDirectoryPathUseDefault'),
                  storageDirectoryPath: trim(getFieldValue('storageDirectoryPath')),
                  uuid: trim(getFieldValue('uuid')),
                };
                console.log('5');

                const validation = validateCertificateAuthorityPayload(payload);
                if (validation && validation.summary && validation.summary.length > 0) {
                  applyValidation(validation.fieldErrors);
                  return;
                }
                console.log('6');

                try {
                  vscode.postMessage({ type: 'submitCertificateAuthorityForm', payload });
                } catch (error) {
                }
                console.log('7');
              };

              if (submitButton instanceof HTMLElement) {
                console.log('triggered');
                submitButton.addEventListener('click', submitForm);
              }

              if (
                form instanceof HTMLFormElement &&
                workspaceFolderUriSelect instanceof HTMLSelectElement &&
                checkbox instanceof HTMLInputElement &&
                storageDirectoryPathInput instanceof HTMLInputElement &&
                certificateValidityDaysUseDefaultCheckbox instanceof HTMLInputElement &&
                certificateValidityDaysInput instanceof HTMLInputElement &&
                certificateKeySizeUseDefaultCheckbox instanceof HTMLInputElement &&
                certificateKeySizeInput instanceof HTMLInputElement
              ) {
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
                    const defaultValue = element.dataset.defaultValue;
                    const nextValue = (initialValue !== undefined && initialValue !== '')
                      ? initialValue
                      : (defaultValue ?? undefined);

                    if (nextValue !== undefined) {
                      element.defaultValue = nextValue;
                      element.value = nextValue;
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
                    const initialValue = element.dataset.initialValue;
                    const defaultValue = element.dataset.defaultValue;
                    const nextValue = (initialValue !== undefined && initialValue !== '')
                      ? initialValue
                      : (defaultValue ?? undefined);

                    if (nextValue !== undefined) {
                      element.value = nextValue;
                      for (const option of Array.from(element.options)) {
                        option.defaultSelected = option.value === nextValue;
                      }
                    }
                    continue;
                  }
                }

                const defaultStorageDirectoryPath = storageDirectoryPathInput.dataset.defaultValue ?? '';
                let previousManualStoragePath = '';
                let hasPreviousManualStoragePath = false;

                const syncStorageDirectoryPath = () => {
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

                const defaultCertificateValidityDays = certificateValidityDaysInput.dataset.defaultValue ?? '';
                let previousManualCertificateValidityDays = '';
                let hasPreviousManualCertificateValidityDays = false;

                const syncCertificateValidityDays = () => {
                  if (certificateValidityDaysUseDefaultCheckbox.checked === true) {
                    if (hasPreviousManualCertificateValidityDays === false) {
                      previousManualCertificateValidityDays = certificateValidityDaysInput.value;
                      hasPreviousManualCertificateValidityDays = true;
                    }
                    certificateValidityDaysInput.value = defaultCertificateValidityDays;
                    certificateValidityDaysInput.disabled = true;
                    certificateValidityDaysInput.setAttribute('disabled', '');
                    return;
                  }

                  certificateValidityDaysInput.disabled = false;
                  certificateValidityDaysInput.removeAttribute('disabled');
                  if (hasPreviousManualCertificateValidityDays === true) {
                    certificateValidityDaysInput.value = previousManualCertificateValidityDays;
                    hasPreviousManualCertificateValidityDays = false;
                  }
                };

                const defaultCertificateKeySize = certificateKeySizeInput.dataset.defaultValue ?? '';
                let previousManualCertificateKeySize = '';
                let hasPreviousManualCertificateKeySize = false;

                const syncCertificateKeySize = () => {
                  if (certificateKeySizeUseDefaultCheckbox.checked === true) {
                    if (hasPreviousManualCertificateKeySize === false) {
                      previousManualCertificateKeySize = certificateKeySizeInput.value;
                      hasPreviousManualCertificateKeySize = true;
                    }
                    certificateKeySizeInput.value = defaultCertificateKeySize;
                    certificateKeySizeInput.disabled = true;
                    certificateKeySizeInput.setAttribute('disabled', '');
                    return;
                  }

                  certificateKeySizeInput.disabled = false;
                  certificateKeySizeInput.removeAttribute('disabled');
                  if (hasPreviousManualCertificateKeySize === true) {
                    certificateKeySizeInput.value = previousManualCertificateKeySize;
                    hasPreviousManualCertificateKeySize = false;
                  }
                };

                const syncAll = () => {
                  syncStorageDirectoryPath();
                  syncCertificateValidityDays();
                  syncCertificateKeySize();
                };

                checkbox.addEventListener('change', syncAll);
                certificateValidityDaysUseDefaultCheckbox.addEventListener('change', syncAll);
                certificateKeySizeUseDefaultCheckbox.addEventListener('change', syncAll);
                syncAll();

                if (resetButton instanceof HTMLElement) {
                  resetButton.addEventListener('click', () => {
                    return void vscode?.postMessage({ type: 'confirmResetInitial' });
                  });
                }

                window.addEventListener('message', (event) => {
                  const message = event && event.data;
                  if (!message) {
                    return;
                  }

                  if (message.type === 'confirmResetInitialResult') {
                    if (message.ok !== true) {
                      return;
                    }
                    previousManualStoragePath = '';
                    hasPreviousManualStoragePath = false;
                    previousManualCertificateValidityDays = '';
                    hasPreviousManualCertificateValidityDays = false;
                    previousManualCertificateKeySize = '';
                    hasPreviousManualCertificateKeySize = false;
                    form.reset();
                    clearValidation();
                    syncAll();

                    return;
                  }

                  if (message.type === 'certificateAuthorityFormValidationResult') {
                    applyValidation(message.fieldErrors);
                    return;
                  }
                });
              }
            `}
          </script>
        </body>
      </html>
    </>
  );
}
