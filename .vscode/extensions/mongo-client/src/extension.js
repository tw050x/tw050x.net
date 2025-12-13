const vscode = require('vscode');
const { MongoConnectionsClient, sanitizeMongoUri } = require('./mongoClient');
const { MongoTreeDataProvider } = require('./mongoTreeDataProvider');
const { MongoFileSystemProvider } = require('./mongoFileSystemProvider');
const { MongoMetaFileSystemProvider } = require('./mongoMetaFileSystemProvider');
const { EJSON } = require('bson');

let treeDataProvider;
let lastOpen;

async function activate(context) {
    const mongoClient = MongoConnectionsClient.getInstance();
    await mongoClient.initialize(context);

    treeDataProvider = new MongoTreeDataProvider(mongoClient);

    const fsProvider = new MongoFileSystemProvider(mongoClient);
    context.subscriptions.push(
        vscode.workspace.registerFileSystemProvider('mongo', fsProvider, {
            isCaseSensitive: true
        })
    );

    const metaFsProvider = new MongoMetaFileSystemProvider(mongoClient);
    context.subscriptions.push(
        vscode.workspace.registerFileSystemProvider('mongo-meta', metaFsProvider, {
            isCaseSensitive: true
        })
    );

    const treeView = vscode.window.createTreeView('mongoExplorer', { treeDataProvider });
    context.subscriptions.push(treeView);

    context.subscriptions.push(
        vscode.commands.registerCommand('mongo.addConnection', async () => {
            await openConnectionForm(context, undefined);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('mongo.connectToConnection', async (item) => {
            if (!item || item.contextValue !== 'connection') {
                return;
            }
            try {
                await mongoClient.connect(item.connection.id);
                treeDataProvider.refresh();
            } catch (_error) {
                // Errors are surfaced by the client.
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('mongo.editConnection', async (item) => {
            if (!item || item.contextValue !== 'connection') {
                return;
            }
            await openConnectionForm(context, item.connection);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('mongo.deleteConnection', async (item) => {
            if (!item || item.contextValue !== 'connection') {
                return;
            }
            const answer = await vscode.window.showWarningMessage(
                `Are you sure you want to delete connection "${item.connection.name}"?`,
                'Yes',
                'No'
            );

            if (answer === 'Yes') {
                await mongoClient.deleteConnection(item.connection.id);
                treeDataProvider.refresh();
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('mongo.refresh', () => {
            treeDataProvider.refresh();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('mongo.openDocument', async (item) => {
            if (!item || item.contextValue !== 'document') {
                return;
            }
            if (!mongoClient.getClient(item.connectionId)) {
                try {
                    await mongoClient.connect(item.connectionId);
                } catch (_error) {
                    return;
                }
            }

            const idEjson = encodeURIComponent(EJSON.stringify(item.documentId, { relaxed: false }));
            const uri = vscode.Uri.parse(
                `mongo://${item.connectionId}/${encodeURIComponent(item.dbName)}/${encodeURIComponent(
                    item.collectionName
                )}/${idEjson}`
            );

            const document = await vscode.workspace.openTextDocument(uri);
            try {
                await vscode.languages.setTextDocumentLanguage(document, 'json');
            } catch (_error) {
                // ignore
            }
            const shouldPin = isDoubleClick(uri.toString());
            await vscode.window.showTextDocument(document, { preview: !shouldPin });
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('mongo.insertDocument', async (item) => {
            if (!item || item.contextValue !== 'collection') {
                return;
            }

            if (!mongoClient.getClient(item.connectionId)) {
                try {
                    await mongoClient.connect(item.connectionId);
                } catch (_error) {
                    return;
                }
            }

            const raw = await vscode.window.showInputBox({
                prompt: 'Insert a document as Extended JSON',
                value: '{\n  \n}',
                validateInput: (value) => {
                    try {
                        const parsed = EJSON.parse(value);
                        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                            return 'Expected a JSON object';
                        }
                        return null;
                    } catch (error) {
                        return error?.message ?? 'Invalid JSON';
                    }
                }
            });

            if (raw === undefined) {
                return;
            }

            const doc = EJSON.parse(raw);
            const result = await mongoClient.insertDocument(item.connectionId, item.dbName, item.collectionName, doc);
            vscode.window.showInformationMessage(`Inserted document ${String(result?.insertedId ?? '')}`);
            treeDataProvider.refresh();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('mongo.deleteDocument', async (item) => {
            if (!item || item.contextValue !== 'document') {
                return;
            }

            const answer = await vscode.window.showWarningMessage('Delete this document?', 'Yes', 'No');
            if (answer !== 'Yes') {
                return;
            }

            if (!mongoClient.getClient(item.connectionId)) {
                try {
                    await mongoClient.connect(item.connectionId);
                } catch (_error) {
                    return;
                }
            }

            await mongoClient.deleteDocumentById(item.connectionId, item.dbName, item.collectionName, item.documentId);
            vscode.window.showInformationMessage('Deleted document');
            treeDataProvider.refresh();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('mongo.showMetadata', async (item) => {
            if (!item || !item.contextValue) {
                return;
            }

            const kind = item.contextValue;

            if (kind === 'database') {
                const uri = vscode.Uri.parse(
                    `mongo-meta://${item.connectionId}/database/${encodeURIComponent(item.dbName)}`
                );
                const doc = await vscode.workspace.openTextDocument(uri);
                try {
                    await vscode.languages.setTextDocumentLanguage(doc, 'json');
                } catch (_error) {
                    // ignore
                }
                await vscode.window.showTextDocument(doc, { preview: true });
                return;
            }

            if (kind === 'collection') {
                const uri = vscode.Uri.parse(
                    `mongo-meta://${item.connectionId}/collection/${encodeURIComponent(item.dbName)}/${encodeURIComponent(
                        item.collectionName
                    )}`
                );
                const doc = await vscode.workspace.openTextDocument(uri);
                try {
                    await vscode.languages.setTextDocumentLanguage(doc, 'json');
                } catch (_error) {
                    // ignore
                }
                await vscode.window.showTextDocument(doc, { preview: true });
                return;
            }

            if (kind === 'document') {
                const idEjson = encodeURIComponent(EJSON.stringify(item.documentId, { relaxed: false }));
                const uri = vscode.Uri.parse(
                    `mongo-meta://${item.connectionId}/document/${encodeURIComponent(item.dbName)}/${encodeURIComponent(
                        item.collectionName
                    )}/${idEjson}`
                );
                const doc = await vscode.workspace.openTextDocument(uri);
                try {
                    await vscode.languages.setTextDocumentLanguage(doc, 'json');
                } catch (_error) {
                    // ignore
                }
                await vscode.window.showTextDocument(doc, { preview: true });
                return;
            }

            // connection or other
            if (kind === 'connection') {
                const hydrated = await mongoClient.getConnectionWithSecrets(item.connection.id);
                const payload = {
                    name: hydrated?.name ?? item.connection.name,
                    uri: sanitizeMongoUri(hydrated?.uri ?? '')
                };
                const virtual = vscode.Uri.parse(`mongo-meta://${item.connection.id}/connection`);
                // quick inline: show JSON in a new untitled doc
                const doc = await vscode.workspace.openTextDocument({
                    language: 'json',
                    content: JSON.stringify(payload, null, 2)
                });
                await vscode.window.showTextDocument(doc, { preview: true });
                void virtual;
            }
        })
    );
}

async function openConnectionForm(context, connection) {
    const panel = vscode.window.createWebviewPanel(
        'mongoConnectionForm',
        connection ? 'Edit Connection' : 'Add Connection',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: []
        }
    );

    const mongoClient = MongoConnectionsClient.getInstance();
    const hydrated = connection?.id ? await mongoClient.getConnectionWithSecrets(connection.id) : connection;
    const targetConnection = hydrated ?? connection;

    panel.webview.html = getWebviewContent(targetConnection);

    panel.webview.onDidReceiveMessage(
        async (message) => {
            switch (message.command) {
                case 'saveConnection': {
                    const mongoClient = MongoConnectionsClient.getInstance();
                    try {
                        if (targetConnection?.id) {
                            await mongoClient.updateConnection(targetConnection.id, message.data);
                        } else {
                            await mongoClient.addConnection(message.data);
                        }
                        treeDataProvider.refresh();
                        panel.dispose();
                        vscode.window.showInformationMessage('Connection saved successfully');
                    } catch (_error) {
                        vscode.window.showErrorMessage('Failed to save connection');
                    }
                    return;
                }
                default:
                    return;
            }
        },
        undefined,
        context.subscriptions
    );
}

function getWebviewContent(connection) {
    const name = (connection === null || connection === undefined ? '' : connection.name) || '';
    const uri = (connection === null || connection === undefined ? '' : connection.uri) || 'mongodb://localhost:27017';

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MongoDB Connection</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    font-size: var(--vscode-font-size);
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    padding: 20px;
                    margin: 0;
                }
                .form-group { margin-bottom: 15px; }
                label {
                    display: block;
                    margin-bottom: 5px;
                    color: var(--vscode-input-foreground);
                }
                input {
                    width: 100%;
                    padding: 8px;
                    box-sizing: border-box;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 3px;
                }
                input:focus {
                    outline: 1px solid var(--vscode-focusBorder);
                }
                button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 10px 15px;
                    cursor: pointer;
                    border-radius: 3px;
                }
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .hint {
                    color: var(--vscode-descriptionForeground);
                    margin-top: 6px;
                    font-size: 0.9em;
                }
                code { font-family: var(--vscode-editor-font-family); }
            </style>
        </head>
        <body>
            <h2>${connection?.id ? 'Edit Connection' : 'Add Connection'}</h2>
            <div class="form-group">
                <label for="name">Name</label>
                <input type="text" id="name" value="${escapeHtml(name)}" placeholder="Local Mongo" />
            </div>
            <div class="form-group">
                <label for="uri">MongoDB URI</label>
                <input type="text" id="uri" value="${escapeHtml(uri)}" placeholder="mongodb://localhost:27017" />
                <div class="hint">Examples: <code>mongodb://localhost:27017</code>, <code>mongodb+srv://user:pass@cluster0.example.com</code></div>
            </div>
            <button onclick="saveConnection()">Save</button>

            <script>
                const vscode = acquireVsCodeApi();

                function saveConnection() {
                    const name = document.getElementById('name').value;
                    const uri = document.getElementById('uri').value;
                    vscode.postMessage({ command: 'saveConnection', data: { name, uri, displayUri: uri } });
                }
            </script>
        </body>
        </html>
    `;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function isDoubleClick(uriString) {
    const now = Date.now();
    const isSame = lastOpen?.uri === uriString;
    const isQuick = typeof lastOpen?.time === 'number' && now - lastOpen.time < 450;
    lastOpen = { uri: uriString, time: now };
    return isSame && isQuick;
}

module.exports = { activate };
