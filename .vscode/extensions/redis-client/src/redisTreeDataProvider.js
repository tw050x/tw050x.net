const vscode = require('vscode');
class RedisTreeDataProvider {
    constructor(client) {
        this.client = client;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.filterText = '';
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }

    setFilter(text) {
        this.filterText = text ?? '';
        this.refresh();
    }

    getTreeItem(element) {
        return element;
    }

    async getChildren(element) {
        if (!element) {
            const connections = this.client.getConnections();
            if (connections.length === 0) {
                return [new KeyItem('No connections', '', '', 'no-connections')];
            }
            return connections.map((conn) => new ConnectionItem(conn));
        }

        if (element.contextValue === 'connection') {
            return this.getNamespaceChildren(element.connection.id, []);
        }

        if (element.contextValue === 'namespace') {
            return this.getNamespaceChildren(element.connectionId, element.prefix.split(':'));
        }

        return [];
    }

    async getNamespaceChildren(connectionId, prefixSegments) {
        if (!this.client.getClient(connectionId)) {
            return [new KeyItem('Not connected', connectionId, '', 'error')];
        }

        try {
            const keys = await this.client.getKeys(connectionId);
            const filteredKeys = this.filterText
                ? await this.filterKeysByNameOrContent(connectionId, keys, this.filterText)
                : keys;
            const namespaces = new Map();
            const keyItems = [];

            for (const key of filteredKeys) {
                const parts = key.split(':');
                if (parts.length === 0) {
                    continue;
                }

                // Ensure the key is within the requested prefix.
                if (prefixSegments.length > 0) {
                    const head = parts.slice(0, prefixSegments.length);
                    const matchesPrefix = head.every((part, idx) => part === prefixSegments[idx]);
                    if (!matchesPrefix) {
                        continue;
                    }
                }

                const remainder = parts.slice(prefixSegments.length);
                if (remainder.length === 0) {
                    // Key exactly matches the prefix; surface as leaf with full key.
                    const displayLabel = parts[parts.length - 1];
                    keyItems.push(new KeyItem(displayLabel, connectionId, key));
                    continue;
                }

                if (remainder.length === 1) {
                    const displayLabel = remainder[0];
                    keyItems.push(new KeyItem(displayLabel, connectionId, key));
                } else {
                    const nsLabel = remainder[0];
                    const nsPrefix = prefixSegments.length > 0
                        ? `${prefixSegments.join(':')}:${nsLabel}`
                        : nsLabel;
                    if (!namespaces.has(nsPrefix)) {
                        namespaces.set(nsPrefix, new NamespaceItem(nsLabel, connectionId, nsPrefix));
                    }
                }
            }

            const combined = [...namespaces.values(), ...keyItems];
            combined.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' }));
            return combined;
        } catch (_error) {
            vscode.window.showErrorMessage('Failed to fetch keys');
            return [];
        }
    }

    async filterKeysByNameOrContent(connectionId, keys, filterText) {
        const needle = filterText.toLowerCase();
        const results = [];

        for (const key of keys) {
            if (key.toLowerCase().includes(needle)) {
                results.push(key);
                continue;
            }

            try {
                const type = await this.client.getType(connectionId, key);
                if (!type || type === 'none') {
                    continue;
                }

                let content = '';
                switch (type) {
                    case 'string':
                        content = (await this.client.get(connectionId, key)) ?? '';
                        break;
                    case 'hash':
                        content = JSON.stringify((await this.client.getHash(connectionId, key)) ?? {});
                        break;
                    case 'list':
                        content = JSON.stringify((await this.client.getList(connectionId, key)) ?? []);
                        break;
                    case 'set':
                        content = JSON.stringify((await this.client.getSet(connectionId, key)) ?? []);
                        break;
                    case 'zset':
                        content = JSON.stringify((await this.client.getZSet(connectionId, key)) ?? []);
                        break;
                    default:
                        content = '';
                }

                if (content && content.toLowerCase().includes(needle)) {
                    results.push(key);
                }
            } catch (_error) {
                // Ignore individual key errors and continue.
            }
        }

        return results;
    }
}

class RedisItem extends vscode.TreeItem {
    constructor(label, collapsibleState, contextValue) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.contextValue = contextValue;
        this.tooltip = this.label;
    }
}

class ConnectionItem extends RedisItem {
    constructor(connection) {
        super(connection.name, vscode.TreeItemCollapsibleState.Collapsed, 'connection');
        this.connection = connection;
        this.iconPath = new vscode.ThemeIcon('database');
        this.description = `${connection.host}:${connection.port}`;
    }
}

class NamespaceItem extends RedisItem {
    constructor(label, connectionId, prefix) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed, 'namespace');
        this.connectionId = connectionId;
        this.prefix = prefix;
        this.iconPath = new vscode.ThemeIcon('folder');
        this.tooltip = prefix;
    }
}

class KeyItem extends RedisItem {
    constructor(label, connectionId, key, contextValue = 'key') {
        super(label, vscode.TreeItemCollapsibleState.None, contextValue);
        this.label = label;
        this.connectionId = connectionId;
        this.key = key;
        this.contextValue = contextValue;
        this.tooltip = key;
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

module.exports = {
    RedisTreeDataProvider,
    RedisItem,
    ConnectionItem,
    NamespaceItem,
    KeyItem
};
