const vscode = require('vscode');
const { EJSON, ObjectId } = require('bson');

class MongoTreeDataProvider {
    constructor(client) {
        this.client = client;
        this.emitter = new vscode.EventEmitter();
        this.onDidChangeTreeData = this.emitter.event;
        this.docLimitByCollectionKey = new Map();
        this.docFilterByCollectionKey = new Map();
        this.collectionSearchLabelByKey = new Map();
    }

    refresh() {
        this.emitter.fire();
    }

    setCollectionSearch(connectionId, dbName, collectionName, { filter, limit, label }) {
        const key = `${connectionId}/${dbName}/${collectionName}`;
        if (typeof limit === 'number' && Number.isFinite(limit) && limit > 0) {
            this.docLimitByCollectionKey.set(key, Math.floor(limit));
        }
        if (filter && typeof filter === 'object' && !Array.isArray(filter)) {
            this.docFilterByCollectionKey.set(key, filter);
        } else {
            this.docFilterByCollectionKey.delete(key);
        }
        const safeLabel = typeof label === 'string' ? label.trim() : '';
        if (safeLabel) {
            this.collectionSearchLabelByKey.set(key, safeLabel);
        } else {
            this.collectionSearchLabelByKey.delete(key);
        }
        this.refresh();
    }

    clearCollectionSearch(connectionId, dbName, collectionName) {
        const key = `${connectionId}/${dbName}/${collectionName}`;
        this.docFilterByCollectionKey.delete(key);
        this.collectionSearchLabelByKey.delete(key);
        this.refresh();
    }

    getTreeItem(element) {
        return element;
    }

    async getChildren(element) {
        if (!element) {
            return this.getConnectionNodes();
        }

        switch (element.contextValue) {
            case 'connection':
                return this.getDatabaseNodes(element);
            case 'database':
                return this.getCollectionNodes(element);
            case 'collection':
                return this.getDocumentNodes(element);
            default:
                return [];
        }
    }

    getConnectionNodes() {
        const connections = this.client.getConnections();
        if (connections.length === 0) {
            const empty = new vscode.TreeItem('No MongoDB connections');
            empty.contextValue = 'empty';
            empty.collapsibleState = vscode.TreeItemCollapsibleState.None;
            empty.description = 'Use “Add Connection”';
            return [empty];
        }

        return connections.map((connection) => {
            const item = new vscode.TreeItem(connection.name, vscode.TreeItemCollapsibleState.Collapsed);
            item.contextValue = 'connection';
            item.connection = connection;
            item.description = connection.displayUri || '';
            item.iconPath = new vscode.ThemeIcon('database');
            return item;
        });
    }

    async getDatabaseNodes(connectionItem) {
        const connectionId = connectionItem.connection.id;
        if (!this.client.getClient(connectionId)) {
            return [
                makeActionItem('Not connected', 'mongo.connectToConnection', connectionItem, 'plug')
            ];
        }

        const dbNames = await this.client.listDatabases(connectionId);
        return dbNames.map((dbName) => {
            const item = new vscode.TreeItem(dbName, vscode.TreeItemCollapsibleState.Collapsed);
            item.contextValue = 'database';
            item.connectionId = connectionId;
            item.dbName = dbName;
            item.iconPath = new vscode.ThemeIcon('folder');
            return item;
        });
    }

    async getCollectionNodes(dbItem) {
        const { connectionId, dbName } = dbItem;
        const collections = await this.client.listCollections(connectionId, dbName);
        return collections.map((collectionName) => {
            const item = new vscode.TreeItem(collectionName, vscode.TreeItemCollapsibleState.Collapsed);
            item.contextValue = 'collection';
            item.connectionId = connectionId;
            item.dbName = dbName;
            item.collectionName = collectionName;
            item.iconPath = new vscode.ThemeIcon('list-unordered');

            const key = `${connectionId}/${dbName}/${collectionName}`;
            const limit = this.docLimitByCollectionKey.get(key);
            const hasFilter = this.docFilterByCollectionKey.has(key);
            const label = this.collectionSearchLabelByKey.get(key);
            if (hasFilter || typeof limit === 'number') {
                const bits = [];
                if (label) bits.push(label);
                else if (hasFilter) bits.push('filtered');
                if (typeof limit === 'number') bits.push(`limit ${limit}`);
                item.description = bits.join(', ');
            }
            return item;
        });
    }

    async getDocumentNodes(collectionItem) {
        const { connectionId, dbName, collectionName } = collectionItem;
        const key = `${connectionId}/${dbName}/${collectionName}`;
        const limit = this.docLimitByCollectionKey.get(key) ?? 50;
        const filter = this.docFilterByCollectionKey.get(key) ?? {};

        const docs = await this.client.findDocuments(connectionId, dbName, collectionName, { filter, limit });

        const items = docs.map((doc) => {
            const idLabel = formatIdForLabel(doc?._id);
            const label = idLabel || '(no _id)';
            const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
            item.contextValue = 'document';
            item.connectionId = connectionId;
            item.dbName = dbName;
            item.collectionName = collectionName;
            item.documentId = doc?._id;
            item.iconPath = new vscode.ThemeIcon('json');
            item.command = {
                command: 'mongo.openDocument',
                title: 'Open Document',
                arguments: [item]
            };
            return item;
        });

        return items;
    }
}

function formatIdForLabel(idValue) {
    if (idValue === undefined || idValue === null) {
        return '';
    }
    try {
        if (idValue instanceof ObjectId) {
            return idValue.toHexString();
        }
    } catch (_error) {
        // ignore
    }

    if (typeof idValue === 'string') {
        return idValue;
    }

    // Extended JSON-ish for other scalar ids
    try {
        return EJSON.stringify(idValue, { relaxed: true });
    } catch (_error) {
        return String(idValue);
    }
}

module.exports = { MongoTreeDataProvider };
