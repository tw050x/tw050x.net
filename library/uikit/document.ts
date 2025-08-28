import { resolve } from "node:path";
import { Options, compileFile } from "pug";

// Options
const compileFileOptions: Options = {
  basedir: resolve(__dirname, './document'),
}

// Paths
export const forbiddenDocumentPath = resolve(__dirname, './document/forbidden.pug');
export const notFoundDocumentPath = resolve(__dirname, './document/not-found.pug');
export const unrecoverableDocumentPath = resolve(__dirname, './document/unrecoverable.pug');

// Compiled Files
export const forbiddenDocument = compileFile(forbiddenDocumentPath, compileFileOptions);
export const notFoundDocument = compileFile(notFoundDocumentPath, compileFileOptions);
export const unrecoverableDocument = compileFile(unrecoverableDocumentPath, compileFileOptions);
