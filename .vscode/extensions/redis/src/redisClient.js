const Redis = require('ioredis');
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class RedisClient {
    constructor() {
        this.clients = new Map();
        this.connections = [];
        this.dataPath = undefined;
        this.initialized = false;
        this.context = undefined;
        this.passwordSecretPrefix = 'redisConnectionPassword:';
    }

    static getInstance() {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
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

            let migratedPasswords = false;
            for (const connection of this.connections) {
                if (connection.password) {
                    await this.storePassword(connection.id, connection.password);
                    delete connection.password;
                    migratedPasswords = true;
                }
            }

            let normalizedConnections = false;
            this.connections = this.connections.map((connection) => {
                const sanitized = this.toStoredConnection(connection);
                const id = connection.id || this.generateConnectionId();
                if (!connection.id) {
                    normalizedConnections = true;
                }
                sanitized.id = id;
                return sanitized;
            });

            if (migratedPasswords || normalizedConnections) {
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
        const password = await this.getPassword(id);
        return { ...connection, password: password ?? undefined };
    }

    async addConnection(connection) {
        const next = this.toStoredConnection(connection);
        next.id = this.generateConnectionId();
        this.connections.push(next);
        await this.storePassword(next.id, connection.password);
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
        await this.storePassword(id, connection.password);
        this.saveConnections();
    }

    async deleteConnection(id) {
        this.connections = this.connections.filter((c) => c.id !== id);
        this.disconnect(id);
        if (this.context?.secrets) {
            await this.context.secrets.delete(this.passwordKey(id));
        }
        this.saveConnections();
    }

    async connect(id) {
        const connection = this.connections.find((c) => c.id === id);
        if (!connection) {
            throw new Error('Connection not found');
        }

        const password = await this.getPassword(id);

        if (this.clients.has(id)) {
            this.clients.get(id).disconnect();
        }

        const options = {
            host: connection.host,
            port: connection.port,
            retryStrategy: () => false,
            maxRetriesPerRequest: 0
        };

        if (connection.username) {
            options.username = connection.username;
        }

        if (password) {
            options.password = password;
        }

        const client = new Redis(options);

        return new Promise((resolve, reject) => {
            client.on('connect', () => {
                this.clients.set(id, client);
                vscode.window.showInformationMessage(`Connected to ${connection.name}`);
                resolve();
            });
            client.on('error', (err) => {
                client.disconnect();
                vscode.window.showErrorMessage(`Redis connection error for ${connection.name}: ${err.message}`);
                reject(err);
            });
        });
    }

    disconnect(id) {
        if (this.clients.has(id)) {
            this.clients.get(id).disconnect();
            this.clients.delete(id);
        }
    }

    getClient(id) {
        return this.clients.get(id);
    }

    hasConnectedClients() {
        return this.clients.size > 0;
    }

    async scanKeys(id, { pattern = '*', batchSize = 500, signal } = {}) {
        const client = this.clients.get(id);
        if (!client) {
            return [];
        }
        const keys = [];
        let cursor = '0';
        do {
            if (signal?.aborted) {
                const abortError = new Error('Scan aborted');
                abortError.name = 'AbortError';
                throw abortError;
            }
            const [nextCursor, batch] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', batchSize);
            keys.push(...batch);
            cursor = nextCursor;
        } while (cursor !== '0');
        return keys;
    }

    async getType(id, key) {
        const client = this.clients.get(id);
        if (!client) {
            return null;
        }
        return client.type(key);
    }

    async get(id, key) {
        const client = this.clients.get(id);
        if (!client) {
            return null;
        }
        return client.get(key);
    }

    async getHash(id, key) {
        const client = this.clients.get(id);
        if (!client) {
            return null;
        }
        const result = await client.hgetall(key);
        return Object.keys(result).length === 0 ? {} : result;
    }

    async getList(id, key) {
        const client = this.clients.get(id);
        if (!client) {
            return null;
        }
        return client.lrange(key, 0, -1);
    }

    async getSet(id, key) {
        const client = this.clients.get(id);
        if (!client) {
            return null;
        }
        return client.smembers(key);
    }

    async getZSet(id, key) {
        const client = this.clients.get(id);
        if (!client) {
            return null;
        }
        const entries = await client.zrange(key, 0, -1, 'WITHSCORES');
        const result = [];
        for (let i = 0; i < entries.length; i += 2) {
            result.push({ member: entries[i], score: Number(entries[i + 1]) });
        }
        return result;
    }

    async set(id, key, value) {
        const client = this.clients.get(id);
        if (!client) {
            return;
        }
        await client.set(key, value);
    }

    async setHash(id, key, value) {
        const client = this.clients.get(id);
        if (!client) {
            return;
        }
        const pipeline = client.pipeline();
        pipeline.del(key);
        const entries = Object.entries(value);
        if (entries.length > 0) {
            pipeline.hset(key, value);
        }
        await pipeline.exec();
    }

    async setList(id, key, values) {
        const client = this.clients.get(id);
        if (!client) {
            return;
        }
        const pipeline = client.pipeline();
        pipeline.del(key);
        if (values.length > 0) {
            pipeline.rpush(key, ...values);
        }
        await pipeline.exec();
    }

    async setSet(id, key, values) {
        const client = this.clients.get(id);
        if (!client) {
            return;
        }
        const pipeline = client.pipeline();
        pipeline.del(key);
        if (values.length > 0) {
            pipeline.sadd(key, ...values);
        }
        await pipeline.exec();
    }

    async setZSet(id, key, values) {
        const client = this.clients.get(id);
        if (!client) {
            return;
        }
        const pipeline = client.pipeline();
        pipeline.del(key);
        if (values.length > 0) {
            const flattened = [];
            values.forEach(({ member, score }) => {
                flattened.push(score, member);
            });
            pipeline.zadd(key, ...flattened);
        }
        await pipeline.exec();
    }

    async del(id, key) {
        const client = this.clients.get(id);
        if (!client) {
            return;
        }
        await client.del(key);
    }

    toStoredConnection(connection) {
        const sanitized = {
            name: connection.name?.trim() || 'Redis',
            host: connection.host?.trim() || 'localhost',
            port: typeof connection.port === 'number' ? connection.port : Number(connection.port) || 6379,
            username: connection.username?.trim() || undefined
        };
        if (!sanitized.username) {
            delete sanitized.username;
        }
        return sanitized;
    }

    generateConnectionId() {
        if (crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    passwordKey(id) {
        return `${this.passwordSecretPrefix}${id}`;
    }

    async storePassword(id, password) {
        if (!this.context?.secrets) {
            return;
        }
        const key = this.passwordKey(id);
        if (password === undefined || password === '') {
            await this.context.secrets.delete(key);
            return;
        }
        await this.context.secrets.store(key, password);
    }

    async getPassword(id) {
        if (!this.context?.secrets) {
            return undefined;
        }
        return this.context.secrets.get(this.passwordKey(id));
    }
}

module.exports = { RedisClient };
