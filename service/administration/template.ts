import { resolve } from "node:path";
import { Options, compileFile } from "pug";

const compileFileOptions: Options = {
  basedir: resolve(__dirname, './'),
}

// Paths to document template files
const dashboardDocumentPath = resolve(__dirname, './template/document/dashboard.pug');

// Paths to partials template files

// Compiled document template files
export const dashboardDocument = compileFile(dashboardDocumentPath, compileFileOptions);

// Compiled partial template files
