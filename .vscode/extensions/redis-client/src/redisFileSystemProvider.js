const vscode = require('vscode');

class RedisFileSystemProvider {
    constructor(client) {
        this.client = client;
        this.emitter = new vscode.EventEmitter();
        this.onDidChangeFile = this.emitter.event;
    }

    watch() {
        return new vscode.Disposable(() => undefined);
    }

    async stat(uri) {
        const value = await this.readContent(uri);
        return {
            type: vscode.FileType.File,
            ctime: 0,
            mtime: Date.now(),
            size: value.length
        };
    }

    readDirectory() {
        return [];
    }

    createDirectory() {
        // No-op: Redis keys are not directory-backed.
    }

    async readFile(uri) {
        const value = await this.readContent(uri);
        return Buffer.from(value, 'utf8');
    }

    async writeFile(uri, content) {
        const { connectionId, key } = this.parseUri(uri);
        const text = Buffer.from(content).toString('utf8');
        const type = (await this.client.getType(connectionId, key)) ?? 'string';

        switch (type) {
            case 'string':
            case 'none':
                await this.client.set(connectionId, key, text);
                break;
            case 'hash': {
                const obj = this.parseJsonObject(text, uri);
                await this.client.setHash(connectionId, key, obj);
                break;
            }
            case 'list': {
                const arr = this.parseJsonArray(text, uri);
                await this.client.setList(connectionId, key, arr);
                break;
            }
            case 'set': {
                const arr = this.parseJsonArray(text, uri);
                await this.client.setSet(connectionId, key, arr);
                break;
            }
            case 'zset': {
                const arr = this.parseZSetArray(text, uri);
                await this.client.setZSet(connectionId, key, arr);
                break;
            }
            default:
                throw vscode.FileSystemError.Unavailable(`Writing type '${type}' is not supported`);
        }

        this.emitter.fire([{ type: vscode.FileChangeType.Changed, uri }]);
    }

    async delete(uri) {
        const { connectionId, key } = this.parseUri(uri);
        await this.client.del(connectionId, key);
        this.emitter.fire([{ type: vscode.FileChangeType.Deleted, uri }]);
    }

    rename(oldUri, newUri) {
        return (async () => {
            const value = await this.readContent(oldUri);
            const { connectionId: newConnectionId, key: newKey } = this.parseUri(newUri);
            await this.client.set(newConnectionId, newKey, value);
            const { connectionId: oldConnectionId, key: oldKey } = this.parseUri(oldUri);
            await this.client.del(oldConnectionId, oldKey);
            this.emitter.fire([
                { type: vscode.FileChangeType.Deleted, uri: oldUri },
                { type: vscode.FileChangeType.Created, uri: newUri }
            ]);
        })();
    }

    parseUri(uri) {
        const connectionId = uri.authority || '';
        const pathPart = uri.path.replace(/^\//, '');
        if (!connectionId || !pathPart) {
            throw vscode.FileSystemError.FileNotFound(uri);
        }
        const key = decodeURIComponent(pathPart);
        return { connectionId, key };
    }

    async readContent(uri) {
        const { connectionId, key } = this.parseUri(uri);

        const readByType = async (redisType) => {
            switch (redisType) {
                case 'string': {
                    const value = await this.client.get(connectionId, key);
                    if (value === null) {
                        throw vscode.FileSystemError.FileNotFound(uri);
                    }
                    return value;
                }
                case 'hash': {
                    const value = await this.client.getHash(connectionId, key);
                    if (value === null) {
                        throw vscode.FileSystemError.FileNotFound(uri);
                    }
                    return JSON.stringify(value, null, 2);
                }
                case 'list': {
                    const value = await this.client.getList(connectionId, key);
                    if (value === null) {
                        throw vscode.FileSystemError.FileNotFound(uri);
                    }
                    return JSON.stringify(value, null, 2);
                }
                case 'set': {
                    const value = await this.client.getSet(connectionId, key);
                    if (value === null) {
                        throw vscode.FileSystemError.FileNotFound(uri);
                    }
                    return JSON.stringify(value, null, 2);
                }
                case 'zset': {
                    const value = await this.client.getZSet(connectionId, key);
                    if (value === null) {
                        throw vscode.FileSystemError.FileNotFound(uri);
                    }
                    return JSON.stringify(value, null, 2);
                }
                case 'stream': {
                    const client = this.client.getClient(connectionId);
                    if (!client) {
                        throw vscode.FileSystemError.FileNotFound(uri);
                    }
                    const entries = await client.xrange(key, '-', '+', 'COUNT', 100);
                    return JSON.stringify(entries, null, 2);
                }
                case 'none':
                    throw vscode.FileSystemError.FileNotFound(uri);
                default:
                    throw vscode.FileSystemError.Unavailable(`Reading type '${redisType}' is not yet supported.`);
            }
        };

        const initialType = (await this.client.getType(connectionId, key)) ?? 'none';
        try {
            return await readByType(initialType);
        } catch (error) {
            if (typeof error?.message === 'string' && error.message.includes('WRONGTYPE')) {
                const retryType = (await this.client.getType(connectionId, key)) ?? 'none';
                if (retryType !== initialType) {
                    return await readByType(retryType);
                }
            }
            throw error;
        }
    }

    parseJsonObject(text) {
        try {
            const value = JSON.parse(text);
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                const entries = Object.entries(value).reduce((acc, [k, v]) => {
                    acc[k] = v === undefined || v === null ? '' : String(v);
                    return acc;
                }, {});
                return entries;
            }
        } catch (_error) {
            // Fall through
        }
        throw vscode.FileSystemError.Unavailable('Expected JSON object for hash');
    }

    parseJsonArray(text) {
        try {
            const value = JSON.parse(text);
            if (Array.isArray(value)) {
                return value.map((item) => (item === undefined || item === null ? '' : String(item)));
            }
        } catch (_error) {
            // Fall through
        }
        throw vscode.FileSystemError.Unavailable('Expected JSON array');
    }

    parseZSetArray(text) {
        try {
            const value = JSON.parse(text);
            if (Array.isArray(value)) {
                return value.map((item) => {
                    if (item && typeof item === 'object' && 'member' in item && 'score' in item) {
                        return { member: String(item.member), score: Number(item.score) };
                    }
                    throw new Error('Invalid zset entry');
                });
            }
        } catch (_error) {
            // Fall through
        }
        throw vscode.FileSystemError.Unavailable('Expected JSON array of { member, score }');
    }
}

module.exports = { RedisFileSystemProvider };
