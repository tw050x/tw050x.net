const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');

class MongoConnectionsClient {
    constructor() {
        this.clients = new Map();
        this.connections = [];
        this.dataPath = undefined;
        this.initialized = false;
        this.context = undefined;
        this.uriSecretPrefix = 'mongoConnectionUri:';
    }

    static getInstance() {
        if (!MongoConnectionsClient.instance) {
            MongoConnectionsClient.instance = new MongoConnectionsClient();
        }
        return MongoConnectionsClient.instance;
    }

    async initialize(context) {
        if (this.initialized) {
            return;
        }

        this.context = context;
        const storageFolder = context.globalStorageUri.fsPath;
        fs.mkdirSync(storageFolder, { recursive: true });
        this.dataPath = path.join(storageFolder, 'connections.json');

        const legacyPath = path.join(context.extensionUri.fsPath, '.data', 'connections.json');
        const compiledLegacyPath = path.join(__dirname, '..', '.data', 'connections.json');
        await this.loadConnections([legacyPath, compiledLegacyPath]);

        this.initialized = true;
    }

    async loadConnections(candidateLegacyPaths = []) {
        if (!this.dataPath) {
            return;
        }

        const tryLoad = (file) => {
            if (!fs.existsSync(file)) {
                return undefined;
            }
            const raw = fs.readFileSync(file, 'utf8').trim();
            if (!raw) {
                return [];
            }
            return JSON.parse(raw);
        };

        try {
            const fromData = tryLoad(this.dataPath);
            if (Array.isArray(fromData)) {
                this.connections = fromData;
            } else {
                for (const legacyPath of candidateLegacyPaths) {
                    const fromLegacy = tryLoad(legacyPath);
                    if (Array.isArray(fromLegacy)) {
                        this.connections = fromLegacy;
                        break;
                    }
                }
            }

            if (!Array.isArray(this.connections)) {
                this.connections = [];
            }

            let normalized = false;
            this.connections = this.connections.map((connection) => {
                const sanitized = this.toStoredConnection(connection);
                const id = connection.id || this.generateConnectionId();
                if (!connection.id) {
                    normalized = true;
                }
                sanitized.id = id;
                return sanitized;
            });

            if (normalized) {
                this.saveConnections();
            } else if (!fs.existsSync(this.dataPath)) {
                this.saveConnections();
            }
        } catch (error) {
            console.error('Failed to load connections:', error);
        }
    }

    saveConnections() {
        if (!this.dataPath) {
            return;
        }
        try {
            fs.writeFileSync(this.dataPath, JSON.stringify(this.connections, null, 2));
        } catch (error) {
            console.error('Failed to save connections:', error);
        }
    }

    getConnections() {
        return this.connections.map((connection) => ({ ...connection }));
    }

    async getConnectionWithSecrets(id) {
        const connection = this.connections.find((c) => c.id === id);
        if (!connection) {
            return undefined;
        }
        const uri = await this.getUri(id);
        return { ...connection, uri: uri ?? '' };
    }

    async addConnection(connection) {
        const next = this.toStoredConnection(connection);
        next.id = this.generateConnectionId();
        this.connections.push(next);
        await this.storeUri(next.id, connection.uri);
        this.saveConnections();
        return { ...next };
    }

    async updateConnection(id, connection) {
        const index = this.connections.findIndex((c) => c.id === id);
        if (index === -1) {
            return;
        }
        const updated = this.toStoredConnection(connection);
        updated.id = id;
        this.connections[index] = updated;
        await this.storeUri(id, connection.uri);
        this.saveConnections();
    }

    async deleteConnection(id) {
        this.connections = this.connections.filter((c) => c.id !== id);
        await this.disconnect(id);
        if (this.context?.secrets) {
            await this.context.secrets.delete(this.uriKey(id));
        }
        this.saveConnections();
    }

    async connect(id) {
        const connection = this.connections.find((c) => c.id === id);
        if (!connection) {
            throw new Error('Connection not found');
        }

        const uri = await this.getUri(id);
        if (!uri) {
            vscode.window.showErrorMessage(`Missing URI for ${connection.name}`);
            throw new Error('Missing URI');
        }

        const existing = this.clients.get(id);
        if (existing) {
            try {
                await existing.close();
            } catch (_error) {
                // ignore
            }
        }

        const client = new MongoClient(uri, {
            serverSelectionTimeoutMS: 5000
        });

        try {
            await client.connect();
            // quick ping
            await client.db('admin').command({ ping: 1 });
            this.clients.set(id, client);
            vscode.window.showInformationMessage(`Connected to ${connection.name}`);
        } catch (error) {
            try {
                await client.close();
            } catch (_closeError) {
                // ignore
            }
            vscode.window.showErrorMessage(
                `MongoDB connection error for ${connection.name}: ${error?.message ?? String(error)}`
            );
            throw error;
        }
    }

    async disconnect(id) {
        const client = this.clients.get(id);
        if (client) {
            try {
                await client.close();
            } catch (_error) {
                // ignore
            }
            this.clients.delete(id);
        }
    }

    getClient(id) {
        return this.clients.get(id);
    }

    hasConnectedClients() {
        return this.clients.size > 0;
    }

    async listDatabases(connectionId) {
        const client = this.clients.get(connectionId);
        if (!client) {
            return [];
        }
        const admin = client.db('admin').admin();
        const result = await admin.listDatabases();
        return Array.isArray(result.databases) ? result.databases.map((d) => d.name).filter(Boolean) : [];
    }

    async listCollections(connectionId, dbName) {
        const client = this.clients.get(connectionId);
        if (!client) {
            return [];
        }
        const db = client.db(dbName);
        const cols = await db.listCollections({}, { nameOnly: true }).toArray();
        return cols.map((c) => c.name).filter(Boolean);
    }

    async getCollectionStats(connectionId, dbName, collectionName) {
        const client = this.clients.get(connectionId);
        if (!client) {
            return null;
        }
        const db = client.db(dbName);
        try {
            const stats = await db.command({ collStats: collectionName });
            return stats;
        } catch (_error) {
            return null;
        }
    }

    async getCollectionIndexes(connectionId, dbName, collectionName) {
        const client = this.clients.get(connectionId);
        if (!client) {
            return null;
        }
        const db = client.db(dbName);
        try {
            const indexes = await db.collection(collectionName).indexes();
            return indexes;
        } catch (_error) {
            return null;
        }
    }

    async findDocuments(connectionId, dbName, collectionName, { limit = 50 } = {}) {
        const client = this.clients.get(connectionId);
        if (!client) {
            return [];
        }
        const db = client.db(dbName);
        const col = db.collection(collectionName);
        const docs = await col.find({}, { limit }).toArray();
        return docs;
    }

    async findDocumentById(connectionId, dbName, collectionName, idValue) {
        const client = this.clients.get(connectionId);
        if (!client) {
            return null;
        }
        const db = client.db(dbName);
        const col = db.collection(collectionName);
        const doc = await col.findOne({ _id: idValue });
        return doc;
    }

    async replaceDocumentById(connectionId, dbName, collectionName, idValue, nextDoc) {
        const client = this.clients.get(connectionId);
        if (!client) {
            return null;
        }
        const db = client.db(dbName);
        const col = db.collection(collectionName);
        return col.replaceOne({ _id: idValue }, nextDoc, { upsert: false });
    }

    async insertDocument(connectionId, dbName, collectionName, doc) {
        const client = this.clients.get(connectionId);
        if (!client) {
            return null;
        }
        const db = client.db(dbName);
        const col = db.collection(collectionName);
        return col.insertOne(doc);
    }

    async deleteDocumentById(connectionId, dbName, collectionName, idValue) {
        const client = this.clients.get(connectionId);
        if (!client) {
            return null;
        }
        const db = client.db(dbName);
        const col = db.collection(collectionName);
        return col.deleteOne({ _id: idValue });
    }

    toStoredConnection(connection) {
        const name = (connection?.name || '').trim() || 'MongoDB';
        const displayUri = (connection?.displayUri || connection?.uri || '').trim();
        return {
            id: connection?.id,
            name,
            displayUri
        };
    }

    generateConnectionId() {
        return crypto.randomBytes(16).toString('hex');
    }

    uriKey(id) {
        return `${this.uriSecretPrefix}${id}`;
    }

    async storeUri(id, uri) {
        const value = typeof uri === 'string' ? uri.trim() : '';
        if (!this.context?.secrets) {
            throw new Error('Secret storage not available');
        }
        await this.context.secrets.store(this.uriKey(id), value);

        // Also store a sanitized displayUri best-effort.
        const connection = this.connections.find((c) => c.id === id);
        if (connection) {
            connection.displayUri = sanitizeMongoUri(value);
            this.saveConnections();
        }
    }

    async getUri(id) {
        if (!this.context?.secrets) {
            return null;
        }
        const value = await this.context.secrets.get(this.uriKey(id));
        return value ?? null;
    }
}

function sanitizeMongoUri(uri) {
    if (!uri) {
        return '';
    }
    // Best-effort: mask password if present in authority.
    // Handles mongodb://user:pass@host and mongodb+srv://user:pass@host.
    return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:\/]+:)([^@]+)(@)/i, '$1***$3');
}

module.exports = { MongoConnectionsClient, sanitizeMongoUri };
