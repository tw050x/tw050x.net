const vscode = require('vscode');
const { EJSON } = require('bson');

class MongoFileSystemProvider {
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
        // No-op
    }

    async readFile(uri) {
        const value = await this.readContent(uri);
        return Buffer.from(value, 'utf8');
    }

    async writeFile(uri, content) {
        const { connectionId, dbName, collectionName, idEjson } = this.parseUri(uri);
        const text = Buffer.from(content).toString('utf8');

        const originalId = EJSON.parse(decodeURIComponent(idEjson));

        let nextDoc;
        try {
            nextDoc = EJSON.parse(text);
        } catch (error) {
            throw vscode.FileSystemError.Unavailable(`Invalid Extended JSON: ${error?.message ?? String(error)}`);
        }

        if (!nextDoc || typeof nextDoc !== 'object' || Array.isArray(nextDoc)) {
            throw vscode.FileSystemError.Unavailable('Expected a JSON object (document)');
        }

        const nextId = nextDoc._id;
        if (nextId === undefined) {
            throw vscode.FileSystemError.Unavailable('Document must include _id');
        }

        // Disallow changing _id.
        try {
            const a = EJSON.stringify(originalId, { relaxed: false });
            const b = EJSON.stringify(nextId, { relaxed: false });
            if (a !== b) {
                throw vscode.FileSystemError.Unavailable('Changing _id is not supported');
            }
        } catch (error) {
            if (error instanceof vscode.FileSystemError) {
                throw error;
            }
            throw vscode.FileSystemError.Unavailable('Could not validate _id');
        }

        await this.client.replaceDocumentById(connectionId, dbName, collectionName, originalId, nextDoc);
        this.emitter.fire([{ type: vscode.FileChangeType.Changed, uri }]);
    }

    async delete(uri) {
        const { connectionId, dbName, collectionName, idEjson } = this.parseUri(uri);
        const idValue = EJSON.parse(decodeURIComponent(idEjson));
        await this.client.deleteDocumentById(connectionId, dbName, collectionName, idValue);
        this.emitter.fire([{ type: vscode.FileChangeType.Deleted, uri }]);
    }

    rename() {
        throw vscode.FileSystemError.Unavailable('Rename is not supported');
    }

    async readContent(uri) {
        const { connectionId, dbName, collectionName, idEjson } = this.parseUri(uri);
        const idValue = EJSON.parse(decodeURIComponent(idEjson));

        const doc = await this.client.findDocumentById(connectionId, dbName, collectionName, idValue);
        if (!doc) {
            throw vscode.FileSystemError.FileNotFound(uri);
        }

        return prettyEjson(doc, { relaxed: true });
    }

    parseUri(uri) {
        const connectionId = uri.authority || '';
        // mongo://{connectionId}/{db}/{collection}/{idEjson}
        const parts = uri.path.replace(/^\//, '').split('/');
        if (!connectionId || parts.length < 3) {
            throw vscode.FileSystemError.FileNotFound(uri);
        }
        const [dbName, collectionName, ...rest] = parts;
        const idEjson = rest.join('/');
        if (!dbName || !collectionName || !idEjson) {
            throw vscode.FileSystemError.FileNotFound(uri);
        }
        return { connectionId, dbName: decodeURIComponent(dbName), collectionName: decodeURIComponent(collectionName), idEjson };
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

module.exports = { MongoFileSystemProvider };
