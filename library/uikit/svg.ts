import { resolve } from "node:path";
import { Options, compileFile } from "pug";

// Options
const compileFileOptions: Options = {
  basedir: resolve(__dirname, './svg'),
}

// Paths
export const buttonLoaderSvgPath = resolve(__dirname, './svg/button-loader.pug');

// Compiled files
export const buttonLoaderSvg = compileFile(buttonLoaderSvgPath, compileFileOptions);
