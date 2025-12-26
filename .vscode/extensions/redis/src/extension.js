const vscode = require('vscode');
const { RedisClient } = require('./redisClient');
const { RedisTreeDataProvider } = require('./redisTreeDataProvider');
const { RedisFileSystemProvider } = require('./redisFileSystemProvider');

let treeDataProvider;
let lastOpen;
const AUTO_REFRESH_INTERVAL_MS = 5000;

async function activate(context) {
    const redisClient = RedisClient.getInstance();
    await redisClient.initialize(context);

    treeDataProvider = new RedisTreeDataProvider(redisClient);

    const fsProvider = new RedisFileSystemProvider(redisClient);
    context.subscriptions.push(
        vscode.workspace.registerFileSystemProvider('redis', fsProvider, {
            isCaseSensitive: true
        })
    );

    const treeView = vscode.window.createTreeView('redisKeys', { treeDataProvider });
    context.subscriptions.push(treeView);

    context.subscriptions.push(
        vscode.commands.registerCommand('redis.addConnection', async () => {
            await openConnectionForm(context, undefined);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('redis.connectToConnection', async (item) => {
            if (!item || item.contextValue !== 'connection') {
                return;
            }
            try {
                await redisClient.connect(item.connection.id);
                treeDataProvider.refresh();
            } catch (_error) {
                // Errors are surfaced by the client.
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('redis.editConnection', async (item) => {
            if (!item || item.contextValue !== 'connection') {
                return;
            }
            await openConnectionForm(context, item.connection);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('redis.deleteConnection', async (item) => {
            if (!item || item.contextValue !== 'connection') {
                return;
            }
            const answer = await vscode.window.showWarningMessage(
                `Are you sure you want to delete connection "${item.connection.name}"?`,
                'Yes',
                'No'
            );

            if (answer === 'Yes') {
                await redisClient.deleteConnection(item.connection.id);
                treeDataProvider.refresh();
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('redis.refresh', () => {
            treeDataProvider.refresh();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('redis.setFilter', async () => {
            const value = await vscode.window.showInputBox({
                prompt:
                    'Filter keys by name, or prefix with "content:" to inspect values (case-insensitive). Leave empty to clear.',
                value: treeDataProvider.filterText ?? ''
            });
            treeDataProvider.setFilter(value ?? '');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('redis.editEntry', async (item) => {
            if (!item || item.contextValue !== 'key') {
                return;
            }
            const key = item.key;
            const type = (await redisClient.getType(item.connectionId, key)) ?? 'string';

            if (type !== 'string' && type !== 'none') {
                const open = await vscode.window.showInformationMessage(
                    `${key} is type ${type}. Open in editor instead?`,
                    'Open',
                    'Cancel'
                );
                if (open === 'Open') {
                    await vscode.commands.executeCommand('redis.openEntry', item);
                }
                return;
            }

            const value = await redisClient.get(item.connectionId, key);

            if (value === null) {
                vscode.window.showErrorMessage('Key not found or deleted');
                treeDataProvider.refresh();
                return;
            }

            const newValue = await vscode.window.showInputBox({
                prompt: `Edit value for ${key}`,
                value: value,
                placeHolder: 'Enter new value'
            });

            if (newValue !== undefined) {
                await redisClient.set(item.connectionId, key, newValue);
                vscode.window.showInformationMessage(`Updated ${key}`);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('redis.openEntry', async (item) => {
            if (!item || item.contextValue !== 'key') {
                return;
            }
            if (!redisClient.getClient(item.connectionId)) {
                try {
                    await redisClient.connect(item.connectionId);
                } catch (_error) {
                    return;
                }
            }
            const uri = vscode.Uri.parse(`redis://${item.connectionId}/${encodeURIComponent(item.key)}`);
            const document = await vscode.workspace.openTextDocument(uri);
            const shouldPin = isDoubleClick(uri.toString());
            await vscode.window.showTextDocument(document, { preview: !shouldPin });
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('redis.deleteEntry', async (item) => {
            if (!item || item.contextValue !== 'key') {
                return;
            }
            const key = item.key;
            const answer = await vscode.window.showWarningMessage(
                `Are you sure you want to delete ${key}?`,
                'Yes',
                'No'
            );

            if (answer === 'Yes') {
                await redisClient.del(item.connectionId, key);
                vscode.window.showInformationMessage(`Deleted ${key}`);
                treeDataProvider.refresh();
            }
        })
    );

    const autoRefresh = new AutoRefreshScheduler(redisClient, treeDataProvider, treeView);
    context.subscriptions.push(autoRefresh);
}

async function openConnectionForm(context, connection) {
    const panel = vscode.window.createWebviewPanel(
        'redisConnectionForm',
        connection ? 'Edit Connection' : 'Add Connection',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: []
        }
    );

    const redisClient = RedisClient.getInstance();
    const hydrated = connection?.id ? await redisClient.getConnectionWithSecrets(connection.id) : connection;
    const targetConnection = hydrated ?? connection;

    panel.webview.html = getWebviewContent(targetConnection);

    panel.webview.onDidReceiveMessage(
        async (message) => {
            switch (message.command) {
                case 'saveConnection': {
                    const redisClient = RedisClient.getInstance();
                    try {
                        if (targetConnection?.id) {
                            await redisClient.updateConnection(targetConnection.id, message.data);
                        } else {
                            await redisClient.addConnection(message.data);
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
    const host = (connection === null || connection === undefined ? 'localhost' : connection.host) || 'localhost';
    const port = (connection === null || connection === undefined ? 6379 : connection.port) || 6379;
    const username = (connection === null || connection === undefined ? '' : connection.username) || '';
    const password = (connection === null || connection === undefined ? '' : connection.password) || '';

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Redis Connection</title>
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
                    padding: 10px 20px;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: 1px solid var(--vscode-button-border);
                    border-radius: 3px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                h2 {
                    color: var(--vscode-editor-foreground);
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <h2>${connection ? 'Edit' : 'Add'} Redis Connection</h2>
            <form id="connectionForm">
                <div class="form-group">
                    <label for="name">Name:</label>
                    <input type="text" id="name" value="${name}" required>
                </div>
                <div class="form-group">
                    <label for="host">Host:</label>
                    <input type="text" id="host" value="${host}" required>
                </div>
                <div class="form-group">
                    <label for="port">Port:</label>
                    <input type="number" id="port" value="${port}" required>
                </div>
                <div class="form-group">
                    <label for="username">Username (optional):</label>
                    <input type="text" id="username" value="${username}">
                </div>
                <div class="form-group">
                    <label for="password">Password (optional):</label>
                    <input type="password" id="password" value="${password}">
                </div>
                <button type="submit">Save Connection</button>
            </form>
            <script>
                const vscode = acquireVsCodeApi();
                document.getElementById('connectionForm').addEventListener('submit', function(e) {
                    e.preventDefault();
                    const data = {
                        name: document.getElementById('name').value,
                        host: document.getElementById('host').value,
                        port: parseInt(document.getElementById('port').value, 10),
                        username: document.getElementById('username').value || undefined,
                        password: document.getElementById('password').value || undefined
                    };
                    vscode.postMessage({ command: 'saveConnection', data });
                });
            </script>
        </body>
        </html>
    `;
}

function deactivate() {}

function isDoubleClick(uri) {
    const now = Date.now();
    if (lastOpen && lastOpen.uri === uri && now - lastOpen.time < 400) {
        lastOpen = undefined;
        return true;
    }
    lastOpen = { uri, time: now };
    return false;
}

class AutoRefreshScheduler {
    constructor(client, treeDataProvider, treeView) {
        this.client = client;
        this.treeDataProvider = treeDataProvider;
        this.treeView = treeView;
        this.timer = setInterval(() => {
            if (this.shouldRefresh()) {
                this.treeDataProvider.refresh();
            }
        }, AUTO_REFRESH_INTERVAL_MS);
        this.disposables = [];
        this.disposables.push(
            treeView.onDidChangeVisibility((event) => {
                if (event.visible) {
                    this.treeDataProvider.refresh();
                }
            }),
            vscode.window.onDidChangeWindowState((state) => {
                if (state.focused && this.shouldRefresh()) {
                    this.treeDataProvider.refresh();
                }
            })
        );
    }

    shouldRefresh() {
        return this.treeView.visible && vscode.window.state.focused && this.client.hasConnectedClients();
    }

    dispose() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
        this.disposables.forEach((d) => d.dispose());
    }
}

module.exports = { activate, deactivate };
