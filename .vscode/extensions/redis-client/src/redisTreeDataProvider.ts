import * as vscode from 'vscode';
import { RedisClient, Connection } from './redisClient';

export class RedisTreeDataProvider implements vscode.TreeDataProvider<RedisItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<RedisItem | undefined | null | void> = new vscode.EventEmitter<RedisItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<RedisItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private readonly client: RedisClient) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: RedisItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: RedisItem): Promise<RedisItem[]> {
        if (element) {
            if (element.contextValue === 'connection') {
                const connection = element as ConnectionItem;
                if (this.client.getClient(connection.connection.id)) {
                    try {
                        const keys = await this.client.getKeys(connection.connection.id);
                        return keys.sort().map(key => new KeyItem(key, connection.connection.id));
                    } catch (error) {
                        vscode.window.showErrorMessage('Failed to fetch keys');
                        return [];
                    }
                } else {
                    return [new KeyItem('Not connected', connection.connection.id, 'error')];
                }
            }
            return [];
        } else {
            const connections = this.client.getConnections();
            if (connections.length === 0) {
                return [new KeyItem('No connections', '', 'no-connections')];
            }
            return connections.map(conn => new ConnectionItem(conn));
        }
    }
}

export class RedisItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contextValue: string
    ) {
        super(label, collapsibleState);
        this.tooltip = this.label;
    }
}

export class ConnectionItem extends RedisItem {
    constructor(public readonly connection: Connection) {
        super(connection.name, vscode.TreeItemCollapsibleState.Collapsed, 'connection');
        this.iconPath = new vscode.ThemeIcon('database');
        this.description = `${connection.host}:${connection.port}`;
    }
}

export class KeyItem extends RedisItem {
    constructor(
        public readonly label: string,
        public readonly connectionId: string,
        public readonly contextValue: string = 'key'
    ) {
        super(label, vscode.TreeItemCollapsibleState.None, contextValue);
        if (contextValue === 'key') {
            this.iconPath = new vscode.ThemeIcon('key');
            this.command = {
                command: 'redis.openEntry',
                title: 'Open Entry',
                arguments: [this]
            };
        } else if (contextValue === 'error') {
            this.iconPath = new vscode.ThemeIcon('error');
        }
    }
}
