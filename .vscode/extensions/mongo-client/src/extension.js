const vscode = require('vscode');
const { MongoConnectionsClient, sanitizeMongoUri } = require('./mongoClient');
const { MongoTreeDataProvider } = require('./mongoTreeDataProvider');
const { MongoFileSystemProvider } = require('./mongoFileSystemProvider');
const { MongoMetaFileSystemProvider } = require('./mongoMetaFileSystemProvider');
const { EJSON, ObjectId } = require('bson');

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
        vscode.commands.registerCommand('mongo.searchDocuments', async (item) => {
            const collectionItem = resolveSelectedCollectionItem(item, treeView);
            if (!collectionItem) {
                void vscode.window.showInformationMessage('Select a collection in the Mongo Explorer to search.');
                return;
            }

            if (!mongoClient.getClient(collectionItem.connectionId)) {
                try {
                    await mongoClient.connect(collectionItem.connectionId);
                } catch (_error) {
                    return;
                }
            }
            await openSearchPanel(context, mongoClient, collectionItem);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('mongo.clearSearchDocuments', async (item) => {
            const collectionItem = resolveSelectedCollectionItem(item, treeView);
            if (!collectionItem) {
                void vscode.window.showInformationMessage('Select a collection in the Mongo Explorer to clear search.');
                return;
            }
            treeDataProvider.clearCollectionSearch(
                collectionItem.connectionId,
                collectionItem.dbName,
                collectionItem.collectionName
            );
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

function resolveSelectedCollectionItem(item, treeView) {
    if (item && item.contextValue === 'collection') {
        return item;
    }
    const selected = Array.isArray(treeView?.selection) ? treeView.selection[0] : undefined;
    if (selected && selected.contextValue === 'collection') {
        return selected;
    }
    return null;
}

async function openSearchPanel(context, mongoClient, collectionItem) {
    const title = `Search: ${collectionItem.dbName}.${collectionItem.collectionName}`;
    const panel = vscode.window.createWebviewPanel(
        'mongoSearch',
        title,
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: []
        }
    );

    panel.webview.html = getSearchWebviewContent({
        dbName: collectionItem.dbName,
        collectionName: collectionItem.collectionName
    });

    panel.webview.onDidReceiveMessage(
        async (message) => {
            if (!message || typeof message.command !== 'string') {
                return;
            }

            if (message.command === 'applySearch') {
                const term = typeof message.term === 'string' ? message.term.trim() : '';
                const limit = typeof message.limit === 'number' && Number.isFinite(message.limit) ? message.limit : undefined;

                if (!term) {
                    treeDataProvider.clearCollectionSearch(
                        collectionItem.connectionId,
                        collectionItem.dbName,
                        collectionItem.collectionName
                    );
                    panel.dispose();
                    return;
                }

                try {
                    const { filter, label } = await buildMongoFilterFromTerm(mongoClient, collectionItem, term);
                    treeDataProvider.setCollectionSearch(
                        collectionItem.connectionId,
                        collectionItem.dbName,
                        collectionItem.collectionName,
                        { filter, limit, label }
                    );
                    panel.dispose();
                } catch (error) {
                    vscode.window.showErrorMessage(error?.message ?? 'Failed to apply search');
                }
                return;
            }

            if (message.command === 'clearSearch') {
                treeDataProvider.clearCollectionSearch(
                    collectionItem.connectionId,
                    collectionItem.dbName,
                    collectionItem.collectionName
                );
                panel.dispose();
                return;
            }
        },
        undefined,
        context.subscriptions
    );
}

function getSearchWebviewContent({ dbName, collectionName }) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MongoDB Search</title>
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
                    margin-right: 8px;
                }
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .hint {
                    color: var(--vscode-descriptionForeground);
                    margin-top: 6px;
                    font-size: 0.9em;
                    line-height: 1.35;
                }
                code { font-family: var(--vscode-editor-font-family); }
            </style>
        </head>
        <body>
            <h2>Search ${escapeHtml(dbName)}.${escapeHtml(collectionName)}</h2>
            <div class="form-group">
                <label for="term">Search</label>
                <input type="text" id="term" placeholder="e.g. shipped OR \"john smith\"" />
                <div class="hint">
                    Enter a search term. If the collection has a text index, this uses <code>$text</code> search.
                    Otherwise it does a case-insensitive substring match across detected string fields.
                    You can also paste an Extended JSON filter object (e.g. <code>{ &quot;status&quot;: &quot;active&quot; }</code>).
                </div>
            </div>
            <div class="form-group">
                <label for="limit">Limit (optional)</label>
                <input type="text" id="limit" placeholder="50" />
            </div>
            <button onclick="applySearch()">Apply</button>
            <button onclick="clearSearch()">Clear</button>

            <script>
                const vscode = acquireVsCodeApi();

                function applySearch() {
                    const term = document.getElementById('term').value;
                    const limitRaw = (document.getElementById('limit').value || '').trim();
                    let limit = undefined;
                    if (limitRaw) {
                        const n = Number(limitRaw);
                        if (Number.isFinite(n) && n > 0) {
                            limit = Math.floor(n);
                        }
                    }
                    vscode.postMessage({ command: 'applySearch', term, limit });
                }

                function clearSearch() {
                    vscode.postMessage({ command: 'clearSearch' });
                }
            </script>
        </body>
        </html>
    `;
}

async function buildMongoFilterFromTerm(mongoClient, collectionItem, term) {
    const trimmed = (term ?? '').trim();
    if (!trimmed) {
        return { filter: {}, label: '' };
    }

    // If user pasted an Extended JSON filter, use it directly.
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
            const parsed = EJSON.parse(trimmed);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                throw new Error('Expected an object filter');
            }
            return { filter: parsed, label: 'filter' };
        } catch (error) {
            throw new Error(error?.message ?? 'Invalid Extended JSON filter');
        }
    }

    const indexes = await mongoClient.getCollectionIndexes(
        collectionItem.connectionId,
        collectionItem.dbName,
        collectionItem.collectionName
    );

    const hasTextIndex = Array.isArray(indexes)
        ? indexes.some((idx) => {
              const key = idx && typeof idx === 'object' ? idx.key : undefined;
              if (!key || typeof key !== 'object' || Array.isArray(key)) {
                  return false;
              }
              // Text indexes usually have one or more fields mapped to the string 'text'.
              return Object.values(key).some((v) => v === 'text');
          })
        : false;

    if (hasTextIndex) {
        return { filter: { $text: { $search: trimmed } }, label: `search: ${trimForLabel(trimmed)}` };
    }

    // Fallback: substring match across the collection's string fields (best-effort).
    try {
        const sampleDocs = await mongoClient.findDocuments(
            collectionItem.connectionId,
            collectionItem.dbName,
            collectionItem.collectionName,
            { limit: 1 }
        );
        const sample = Array.isArray(sampleDocs) ? sampleDocs[0] : undefined;
        const stringFields = [];
        if (sample && typeof sample === 'object' && !Array.isArray(sample)) {
            for (const [key, value] of Object.entries(sample)) {
                if (typeof key === 'string' && typeof value === 'string') {
                    stringFields.push(key);
                }
            }
        }

        if (stringFields.length > 0) {
            const escaped = escapeRegex(trimmed);
            const predicate = { $regex: escaped, $options: 'i' };
            return {
                filter: { $or: stringFields.map((field) => ({ [field]: predicate })) },
                label: `contains: ${trimForLabel(trimmed)}`
            };
        }
    } catch (_error) {
        // ignore and fall back to _id matching
    }

    // Final fallback: match _id.
    if (/^[a-fA-F0-9]{24}$/.test(trimmed)) {
        try {
            return { filter: { _id: new ObjectId(trimmed) }, label: `id: ${trimForLabel(trimmed)}` };
        } catch (_error) {
            // ignore
        }
    }
    return { filter: { _id: trimmed }, label: `id: ${trimForLabel(trimmed)}` };
}

function trimForLabel(value) {
    const s = String(value);
    return s.length > 32 ? `${s.slice(0, 29)}...` : s;
}

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
