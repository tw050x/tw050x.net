import { resolve } from "node:path";
import { Options, compileFile } from "pug";

const compileFileOptions: Options = {
  basedir: resolve(__dirname, './'),
}

// Paths to document template files
const loginDocumentPath = resolve(__dirname, './template/document/login.pug');

// Paths to partial template files
const loginFormPartialPath = resolve(__dirname, './template/partial/form/login.pug');
const invalidNoncePartialPath = resolve(__dirname, './template/partial/error/invalid-nonce.pug');
const invalidReturnUrlPartialPath = resolve(__dirname, './template/partial/error/invalid-return-url.pug');
const unknownErrorPartialPath = resolve(__dirname, './template/partial/error/unknown.pug');

// Compiled document template files
export const loginDocument = compileFile(loginDocumentPath, compileFileOptions);

// Compiled partial template files
export const loginFormPartial = compileFile(loginFormPartialPath, compileFileOptions);
export const invalidNoncePartial = compileFile(invalidNoncePartialPath, compileFileOptions);
export const invalidReturnUrlPartial = compileFile(invalidReturnUrlPartialPath, compileFileOptions);
export const unknownErrorPartial = compileFile(unknownErrorPartialPath, compileFileOptions);
