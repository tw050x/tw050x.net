import { resolve } from "node:path";
import { Options, compileFile } from "pug";

const compileFileOptions: Options = {
  basedir: resolve(__dirname, './'),
}

// Paths to document template files
const homeDocumentPath = resolve(__dirname, './template/document/home.pug');

// Compiled document template files
export const homeDocument = compileFile(homeDocumentPath, compileFileOptions);
