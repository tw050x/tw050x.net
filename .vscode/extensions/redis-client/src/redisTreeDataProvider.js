const vscode = require('vscode');

const CONTENT_FILTER_LIMIT = 200;
const CONTENT_FILTER_CONCURRENCY = 8;

class RedisTreeDataProvider {
    constructor(client) {
        this.client = client;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.filterText = '';
        this.filterState = { mode: 'none', term: '' };
        this.version = 0;
        this.snapshotCache = new Map();
        this.snapshotPromises = new Map();
        this.scanControllers = new Map();
    }

    refresh() {
        this.version += 1;
        this.clearSnapshots();
        this._onDidChangeTreeData.fire();
    }

    clearSnapshots() {
        this.snapshotCache.clear();
        this.snapshotPromises.clear();
        for (const controller of this.scanControllers.values()) {
            controller.abort();
        }
        this.scanControllers.clear();
    }

    setFilter(text) {
        this.filterText = text ?? '';
        this.filterState = this.parseFilter(this.filterText);
        this.refresh();
    }

    parseFilter(text) {
        const trimmed = (text ?? '').trim();
        if (!trimmed) {
            return { mode: 'none', term: '' };
        }

        const contentMatch = trimmed.match(/^(content|value):(.+)$/i);
        if (contentMatch) {
            return { mode: 'content', term: contentMatch[2].trim() };
        }

        return { mode: 'name', term: trimmed };
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

        const snapshot = await this.getSnapshot(connectionId);
        if (!snapshot) {
            return [];
        }

        const prefixKey = prefixSegments.join(':');
        const node =
            snapshot.get(prefixKey) ||
            (prefixSegments.length === 0
                ? snapshot.get('') || { namespaces: new Map(), keys: [] }
                : undefined);

        if (!node) {
            return [];
        }

        const namespaces = [];
        for (const [label, nsPrefix] of node.namespaces.entries()) {
            namespaces.push(new NamespaceItem(label, connectionId, nsPrefix));
        }

        const keyItems = node.keys.map((key) => {
            const parts = key.split(':');
            const displayLabel = parts[parts.length - 1];
            return new KeyItem(displayLabel, connectionId, key);
        });

        if (namespaces.length === 0 && keyItems.length === 0 && prefixSegments.length === 0) {
            return [new KeyItem('No keys found', connectionId, '', 'info')];
        }

        const combined = [...namespaces, ...keyItems];
        combined.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' }));
        return combined;
    }

    async getSnapshot(connectionId) {
        if (this.snapshotCache.has(connectionId)) {
            return this.snapshotCache.get(connectionId);
        }

        if (this.snapshotPromises.has(connectionId)) {
            return this.snapshotPromises.get(connectionId);
        }

        const currentVersion = this.version;
        const promise = this.buildSnapshot(connectionId, currentVersion)
            .then((result) => {
                if (result && currentVersion === this.version) {
                    this.snapshotCache.set(connectionId, result);
                }
                return result;
            })
            .finally(() => {
                this.snapshotPromises.delete(connectionId);
            });
        this.snapshotPromises.set(connectionId, promise);
        return promise;
    }

    async buildSnapshot(connectionId, version) {
        const controller = new AbortController();
        this.scanControllers.set(connectionId, controller);
        try {
            let keys = await this.client.scanKeys(connectionId, { signal: controller.signal });
            if (version !== this.version) {
                return undefined;
            }

            if (this.filterState.mode === 'name') {
                const needle = this.filterState.term.toLowerCase();
                keys = keys.filter((key) => key.toLowerCase().includes(needle));
            } else if (this.filterState.mode === 'content') {
                keys = await this.filterKeysByContent(connectionId, keys, this.filterState.term);
            }

            return this.buildNamespaceIndex(keys);
        } catch (error) {
            if (error && error.name === 'AbortError') {
                return undefined;
            }
            vscode.window.showErrorMessage('Failed to fetch keys');
            return new Map();
        } finally {
            this.scanControllers.delete(connectionId);
        }
    }

    buildNamespaceIndex(keys) {
        const rootPrefix = '';
        const map = new Map();

        const ensureNode = (prefix) => {
            if (!map.has(prefix)) {
                map.set(prefix, {
                    namespaces: new Map(),
                    keys: []
                });
            }
            return map.get(prefix);
        };

        ensureNode(rootPrefix);

        for (const key of keys) {
            const parts = key.split(':');
            let prefix = rootPrefix;

            for (let i = 0; i < parts.length - 1; i += 1) {
                const segment = parts[i];
                const parent = ensureNode(prefix);
                const childPrefix = prefix ? `${prefix}:${segment}` : segment;
                parent.namespaces.set(segment, childPrefix);
                prefix = childPrefix;
                ensureNode(prefix);
            }

            const node = ensureNode(prefix);
            node.keys.push(key);
        }

        return map;
    }

    async filterKeysByContent(connectionId, keys, rawTerm) {
        const needle = rawTerm.toLowerCase();
        if (!needle) {
            return keys;
        }

        const subset = keys.slice(0, CONTENT_FILTER_LIMIT);
        const matches = new Set();
        let index = 0;

        const worker = async () => {
            while (index < subset.length) {
                const currentIndex = index;
                index += 1;
                const key = subset[currentIndex];
                // eslint-disable-next-line no-await-in-loop
                const matchesContent = await this.keyMatchesContent(connectionId, key, needle);
                if (matchesContent) {
                    matches.add(key);
                }
            }
        };

        const concurrency = Math.min(CONTENT_FILTER_CONCURRENCY, subset.length || 1);
        const tasks = Array.from({ length: concurrency }, () => worker());
        await Promise.allSettled(tasks);

        const nameMatches = keys.filter((key) => key.toLowerCase().includes(needle));
        nameMatches.forEach((key) => matches.add(key));

        return keys.filter((key) => matches.has(key));
    }

    async keyMatchesContent(connectionId, key, needle) {
        try {
            const type = await this.client.getType(connectionId, key);
            if (!type || type === 'none') {
                return false;
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

            return content.toLowerCase().includes(needle);
        } catch (_error) {
            return false;
        }
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
        } else if (contextValue === 'info') {
            this.iconPath = new vscode.ThemeIcon('info');
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
