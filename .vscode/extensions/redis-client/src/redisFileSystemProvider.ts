import * as vscode from 'vscode';
import { RedisClient } from './redisClient';

export class RedisFileSystemProvider implements vscode.FileSystemProvider {
    private readonly emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    public readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this.emitter.event;

    constructor(private readonly client: RedisClient) {}

    watch(): vscode.Disposable {
        return new vscode.Disposable(() => undefined);
    }

    async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
        const value = await this.readContent(uri);
        return {
            type: vscode.FileType.File,
            ctime: 0,
            mtime: Date.now(),
            size: value.length
        };
    }

    readDirectory(): [string, vscode.FileType][] {
        return [];
    }

    createDirectory(): void {
        // No-op: Redis keys are not directory-backed.
    }

    async readFile(uri: vscode.Uri): Promise<Uint8Array> {
        const value = await this.readContent(uri);
        return Buffer.from(value, 'utf8');
    }

    async writeFile(uri: vscode.Uri, content: Uint8Array): Promise<void> {
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

    async delete(uri: vscode.Uri): Promise<void> {
        const { connectionId, key } = this.parseUri(uri);
        await this.client.del(connectionId, key);
        this.emitter.fire([{ type: vscode.FileChangeType.Deleted, uri }]);
    }

    rename(oldUri: vscode.Uri, newUri: vscode.Uri): void | Thenable<void> {
        // Rename by copying then deleting to keep implementation simple.
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

    private parseUri(uri: vscode.Uri): { connectionId: string; key: string } {
        const connectionId = uri.authority || '';
        const pathPart = uri.path.replace(/^\//, '');
        if (!connectionId || !pathPart) {
            throw vscode.FileSystemError.FileNotFound(uri);
        }
        const key = decodeURIComponent(pathPart);
        return { connectionId, key };
    }

    private async readContent(uri: vscode.Uri): Promise<string> {
        const { connectionId, key } = this.parseUri(uri);

        const readByType = async (redisType: string): Promise<string> => {
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
                    // Read first 100 entries to avoid huge payloads.
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
        } catch (error: any) {
            if (typeof error?.message === 'string' && error.message.includes('WRONGTYPE')) {
                const retryType = (await this.client.getType(connectionId, key)) ?? 'none';
                if (retryType !== initialType) {
                    return await readByType(retryType);
                }
            }
            throw error;
        }
    }

    private parseJsonObject(text: string, uri: vscode.Uri): Record<string, string> {
        try {
            const value = JSON.parse(text);
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                const entries = Object.entries(value).reduce<Record<string, string>>((acc, [k, v]) => {
                    acc[k] = v === undefined || v === null ? '' : String(v);
                    return acc;
                }, {});
                return entries;
            }
        } catch (error) {
            // Fall through to throw below.
        }
        throw vscode.FileSystemError.Unavailable('Expected JSON object for hash');
    }

    private parseJsonArray(text: string, uri: vscode.Uri): string[] {
        try {
            const value = JSON.parse(text);
            if (Array.isArray(value)) {
                return value.map(item => (item === undefined || item === null ? '' : String(item)));
            }
        } catch (error) {
            // Fall through to throw below.
        }
        throw vscode.FileSystemError.Unavailable('Expected JSON array');
    }

    private parseZSetArray(text: string, uri: vscode.Uri): Array<{ member: string; score: number }> {
        try {
            const value = JSON.parse(text);
            if (Array.isArray(value)) {
                return value.map(item => {
                    if (item && typeof item === 'object' && 'member' in item && 'score' in item) {
                        return { member: String((item as any).member), score: Number((item as any).score) };
                    }
                    throw new Error('Invalid zset entry');
                });
            }
        } catch (error) {
            // Fall through to throw below.
        }
        throw vscode.FileSystemError.Unavailable('Expected JSON array of { member, score }');
    }
}
