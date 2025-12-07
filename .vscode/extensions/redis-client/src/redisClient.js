const Redis = require('ioredis');
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

class RedisClient {
    constructor() {
        this.clients = new Map();
        this.connections = [];
        this.dataPath = undefined;
        this.initialized = false;
    }

    static getInstance() {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }

    initialize(context) {
        if (this.initialized) {
            return;
        }

        const storageFolder = context.globalStorageUri.fsPath;
        fs.mkdirSync(storageFolder, { recursive: true });
        this.dataPath = path.join(storageFolder, 'connections.json');
        const legacyPath = path.join(context.extensionUri.fsPath, '.data', 'connections.json');
        const compiledLegacyPath = path.join(__dirname, '..', '.data', 'connections.json');
        this.loadConnections([legacyPath, compiledLegacyPath]);
        this.initialized = true;
    }

    loadConnections(candidateLegacyPaths = []) {
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
            if (fromData && fromData.length > 0) {
                this.connections = fromData;
                return;
            }

            for (const legacyPath of candidateLegacyPaths) {
                const fromLegacy = tryLoad(legacyPath);
                if (fromLegacy && fromLegacy.length >= 0) {
                    this.connections = fromLegacy;
                    this.saveConnections();
                    return;
                }
            }

            this.connections = fromData ?? [];
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
        return this.connections;
    }

    addConnection(connection) {
        const id = Date.now().toString();
        this.connections.push({ ...connection, id });
        this.saveConnections();
    }

    updateConnection(id, connection) {
        const index = this.connections.findIndex((c) => c.id === id);
        if (index !== -1) {
            this.connections[index] = { ...connection, id };
            this.saveConnections();
        }
    }

    deleteConnection(id) {
        this.connections = this.connections.filter((c) => c.id !== id);
        this.disconnect(id);
        this.saveConnections();
    }

    async connect(id) {
        const connection = this.connections.find((c) => c.id === id);
        if (!connection) {
            throw new Error('Connection not found');
        }

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

        if (connection.password) {
            options.password = connection.password;
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

    async getKeys(id, pattern = '*') {
        const client = this.clients.get(id);
        if (!client) {
            return [];
        }
        return client.keys(pattern);
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
}

module.exports = { RedisClient };
