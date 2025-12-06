import Redis from 'ioredis';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface Connection {
    id: string;
    name: string;
    host: string;
    port: number;
    username?: string;
    password?: string;
}

export class RedisClient {
    private static instance: RedisClient;
    private clients: Map<string, Redis> = new Map();
    private connections: Connection[] = [];
    private dataPath: string | undefined;
    private initialized = false;

    private constructor() {}

    public static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }

    public initialize(context: vscode.ExtensionContext): void {
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

    private loadConnections(candidateLegacyPaths: string[] = []): void {
        if (!this.dataPath) {
            return;
        }

        const tryLoad = (file: string): Connection[] | undefined => {
            if (!fs.existsSync(file)) {
                return undefined;
            }
            const raw = fs.readFileSync(file, 'utf8').trim();
            if (!raw) {
                return [];
            }
            return JSON.parse(raw) as Connection[];
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

    private saveConnections(): void {
        if (!this.dataPath) {
            return;
        }
        try {
            fs.writeFileSync(this.dataPath, JSON.stringify(this.connections, null, 2));
        } catch (error) {
            console.error('Failed to save connections:', error);
        }
    }

    public getConnections(): Connection[] {
        return this.connections;
    }

    public addConnection(connection: Omit<Connection, 'id'>): void {
        const id = Date.now().toString();
        this.connections.push({ ...connection, id });
        this.saveConnections();
    }

    public updateConnection(id: string, connection: Omit<Connection, 'id'>): void {
        const index = this.connections.findIndex(c => c.id === id);
        if (index !== -1) {
            this.connections[index] = { ...connection, id };
            this.saveConnections();
        }
    }

    public deleteConnection(id: string): void {
        this.connections = this.connections.filter(c => c.id !== id);
        this.disconnect(id);
        this.saveConnections();
    }

    public async connect(id: string): Promise<void> {
        const connection = this.connections.find(c => c.id === id);
        if (!connection) {
            throw new Error('Connection not found');
        }

        if (this.clients.has(id)) {
            this.clients.get(id)!.disconnect();
        }

        const options: any = {
            host: connection.host,
            port: connection.port,
            retryStrategy: () => false,  // Disable all retries
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

    public disconnect(id: string): void {
        if (this.clients.has(id)) {
            this.clients.get(id)!.disconnect();
            this.clients.delete(id);
        }
    }

    public getClient(id: string): Redis | undefined {
        return this.clients.get(id);
    }

    public async getKeys(id: string, pattern: string = '*'): Promise<string[]> {
        const client = this.clients.get(id);
        if (!client) {
            return [];
        }
        return client.keys(pattern);
    }

    public async getType(id: string, key: string): Promise<string | null> {
        const client = this.clients.get(id);
        if (!client) {
            return null;
        }
        return client.type(key);
    }

    public async get(id: string, key: string): Promise<string | null> {
        const client = this.clients.get(id);
        if (!client) {
            return null;
        }
        return client.get(key);
    }

    public async getHash(id: string, key: string): Promise<Record<string, string> | null> {
        const client = this.clients.get(id);
        if (!client) {
            return null;
        }
        const result = await client.hgetall(key);
        return Object.keys(result).length === 0 ? {} : result;
    }

    public async getList(id: string, key: string): Promise<string[] | null> {
        const client = this.clients.get(id);
        if (!client) {
            return null;
        }
        return client.lrange(key, 0, -1);
    }

    public async getSet(id: string, key: string): Promise<string[] | null> {
        const client = this.clients.get(id);
        if (!client) {
            return null;
        }
        return client.smembers(key);
    }

    public async getZSet(id: string, key: string): Promise<Array<{ member: string; score: number }> | null> {
        const client = this.clients.get(id);
        if (!client) {
            return null;
        }
        const entries = await client.zrange(key, 0, -1, 'WITHSCORES');
        const result: Array<{ member: string; score: number }> = [];
        for (let i = 0; i < entries.length; i += 2) {
            result.push({ member: entries[i], score: Number(entries[i + 1]) });
        }
        return result;
    }

    public async set(id: string, key: string, value: string): Promise<void> {
        const client = this.clients.get(id);
        if (!client) {
            return;
        }
        await client.set(key, value);
    }

    public async setHash(id: string, key: string, value: Record<string, string>): Promise<void> {
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

    public async setList(id: string, key: string, values: string[]): Promise<void> {
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

    public async setSet(id: string, key: string, values: string[]): Promise<void> {
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

    public async setZSet(id: string, key: string, values: Array<{ member: string; score: number }>): Promise<void> {
        const client = this.clients.get(id);
        if (!client) {
            return;
        }
        const pipeline = client.pipeline();
        pipeline.del(key);
        if (values.length > 0) {
            const flattened: (string | number)[] = [];
            values.forEach(({ member, score }) => {
                flattened.push(score, member);
            });
            pipeline.zadd(key, ...flattened);
        }
        await pipeline.exec();
    }

    public async del(id: string, key: string): Promise<void> {
        const client = this.clients.get(id);
        if (!client) {
            return;
        }
        await client.del(key);
    }
}
