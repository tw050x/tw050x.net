import * as vscode from 'vscode';
import { RedisClient, Connection } from './redisClient';
import { RedisTreeDataProvider, ConnectionItem, KeyItem } from './redisTreeDataProvider';
import { RedisFileSystemProvider } from './redisFileSystemProvider';

let treeDataProvider: RedisTreeDataProvider;

export function activate(context: vscode.ExtensionContext) {
    const redisClient = RedisClient.getInstance();
    redisClient.initialize(context);

    treeDataProvider = new RedisTreeDataProvider(redisClient);

    const fsProvider = new RedisFileSystemProvider(redisClient);
    context.subscriptions.push(
        vscode.workspace.registerFileSystemProvider('redis', fsProvider, {
            isCaseSensitive: true
        })
    );

    vscode.window.registerTreeDataProvider('redisKeys', treeDataProvider);

    context.subscriptions.push(
        vscode.commands.registerCommand('redis.addConnection', () => {
            openConnectionForm(context, undefined);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('redis.connectToConnection', async (item: ConnectionItem) => {
            if (!item || item.contextValue !== 'connection') {
                return;
            }
            try {
                await redisClient.connect(item.connection.id);
                treeDataProvider.refresh();
            } catch (error) {
                // Error handled in client
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('redis.editConnection', (item: ConnectionItem) => {
            if (!item || item.contextValue !== 'connection') {
                return;
            }
            openConnectionForm(context, item.connection);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('redis.deleteConnection', async (item: ConnectionItem) => {
            if (!item || item.contextValue !== 'connection') {
                return;
            }
            const answer = await vscode.window.showWarningMessage(
                `Are you sure you want to delete connection "${item.connection.name}"?`,
                'Yes',
                'No'
            );

            if (answer === 'Yes') {
                redisClient.deleteConnection(item.connection.id);
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
        vscode.commands.registerCommand('redis.editEntry', async (item: KeyItem) => {
            if (!item || item.contextValue !== 'key') {
                return;
            }
            const key = item.label;
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
        vscode.commands.registerCommand('redis.openEntry', async (item: KeyItem) => {
            if (!item || item.contextValue !== 'key') {
                return;
            }
            if (!redisClient.getClient(item.connectionId)) {
                try {
                    await redisClient.connect(item.connectionId);
                } catch (error) {
                    return;
                }
            }
            const uri = vscode.Uri.parse(`redis://${item.connectionId}/${encodeURIComponent(item.label)}`);
            const document = await vscode.workspace.openTextDocument(uri);
            const shouldPin = isDoubleClick(uri.toString());
            await vscode.window.showTextDocument(document, { preview: !shouldPin });
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('redis.deleteEntry', async (item: KeyItem) => {
            if (!item || item.contextValue !== 'key') {
                return;
            }
            const key = item.label;
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
}

function openConnectionForm(context: vscode.ExtensionContext, connection?: Connection) {
    const panel = vscode.window.createWebviewPanel(
        'redisConnectionForm',
        connection ? 'Edit Connection' : 'Add Connection',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: []
        }
    );

    panel.webview.html = getWebviewContent(connection);

    panel.webview.onDidReceiveMessage(
        async message => {
            switch (message.command) {
                case 'saveConnection':
                    const redisClient = RedisClient.getInstance();
                    try {
                        if (connection) {
                            redisClient.updateConnection(connection.id, message.data);
                        } else {
                            redisClient.addConnection(message.data);
                        }
                        treeDataProvider.refresh();
                        panel.dispose();
                        vscode.window.showInformationMessage('Connection saved successfully');
                    } catch (error) {
                        vscode.window.showErrorMessage('Failed to save connection');
                    }
                    return;
            }
        },
        undefined,
        context.subscriptions
    );
}

function getWebviewContent(connection?: Connection): string {
    const name = connection?.name || '';
    const host = connection?.host || 'localhost';
    const port = connection?.port || 6379;
    const username = connection?.username || '';
    const password = connection?.password || '';

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
                        port: parseInt(document.getElementById('port').value),
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

export function deactivate() {}

let lastOpen: { uri: string; time: number } | undefined;

function isDoubleClick(uri: string): boolean {
    const now = Date.now();
    if (lastOpen && lastOpen.uri === uri && now - lastOpen.time < 400) {
        lastOpen = undefined;
        return true;
    }
    lastOpen = { uri, time: now };
    return false;
}
