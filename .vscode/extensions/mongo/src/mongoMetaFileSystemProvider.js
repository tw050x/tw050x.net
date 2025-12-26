const vscode = require('vscode');
const { EJSON } = require('bson');

class MongoMetaFileSystemProvider {
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

    createDirectory() {}

    async readFile(uri) {
        const value = await this.readContent(uri);
        return Buffer.from(value, 'utf8');
    }

    writeFile() {
        throw vscode.FileSystemError.Unavailable('Metadata is read-only');
    }

    delete() {
        throw vscode.FileSystemError.Unavailable('Metadata is read-only');
    }

    rename() {
        throw vscode.FileSystemError.Unavailable('Metadata is read-only');
    }

    async readContent(uri) {
        const { kind, connectionId, dbName, collectionName, idEjson } = this.parseUri(uri);

        if (kind === 'collection') {
            const stats = await this.client.getCollectionStats(connectionId, dbName, collectionName);
            const indexes = await this.client.getCollectionIndexes(connectionId, dbName, collectionName);
            const payload = {
                kind,
                connectionId,
                dbName,
                collectionName,
                stats: stats ?? null,
                indexes: indexes ?? null
            };
            return prettyEjson(payload, { relaxed: true });
        }

        if (kind === 'document') {
            const idValue = EJSON.parse(decodeURIComponent(idEjson));
            const doc = await this.client.findDocumentById(connectionId, dbName, collectionName, idValue);
            const docKeys = doc && typeof doc === 'object' ? Object.keys(doc) : [];
            const relaxed = doc ? EJSON.stringify(doc, { relaxed: true }) : null;

            const payload = {
                kind,
                connectionId,
                dbName,
                collectionName,
                _id: doc?._id ?? null,
                keys: docKeys,
                approxSizeBytes: typeof relaxed === 'string' ? Buffer.byteLength(relaxed, 'utf8') : null
            };

            return prettyEjson(payload, { relaxed: true });
        }

        if (kind === 'database') {
            const payload = {
                kind,
                connectionId,
                dbName
            };
            return prettyEjson(payload, { relaxed: true });
        }

        const payload = { kind, connectionId };
        return prettyEjson(payload, { relaxed: true });
    }

    parseUri(uri) {
        const connectionId = uri.authority || '';
        // mongo-meta://{connectionId}/{kind}/{db?}/{collection?}/{id?}
        const parts = uri.path.replace(/^\//, '').split('/');
        const kind = parts[0] || '';
        const dbName = parts[1] ? decodeURIComponent(parts[1]) : '';
        const collectionName = parts[2] ? decodeURIComponent(parts[2]) : '';
        const idEjson = parts.slice(3).join('/');

        if (!connectionId || !kind) {
            throw vscode.FileSystemError.FileNotFound(uri);
        }

        return { kind, connectionId, dbName, collectionName, idEjson };
    }
}

function prettyEjson(value, options) {
    const raw = EJSON.stringify(value, options);
    try {
        return JSON.stringify(JSON.parse(raw), null, 2) + '\n';
    } catch (_error) {
        return raw + '\n';
    }
}

module.exports = { MongoMetaFileSystemProvider };
