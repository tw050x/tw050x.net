import { resolve } from "node:path";
import { Options, compileFile } from "pug";

// Options
const compileFileOptions: Options = {
  basedir: resolve(__dirname, './partial'),
}

// Paths
export const htmxPartialPath = resolve(__dirname, './partial/htmx.pug');
export const noticeUnrecoverableErrorPartialPath = resolve(__dirname, './partial/notice--unrecoverable-error.pug');
export const noticeValidationErrorPartialPath = resolve(__dirname, './partial/notice--validation-error.pug');
export const stylesheetPartialPath = resolve(__dirname, './partial/stylesheet.pug');

// Compiled files
export const htmxPartial = compileFile(htmxPartialPath, compileFileOptions);
export const noticeUnrecoverableErrorPartial = compileFile(noticeUnrecoverableErrorPartialPath, compileFileOptions);
export const noticeValidationErrorPartial = compileFile(noticeValidationErrorPartialPath, compileFileOptions);
export const stylesheetPartial = compileFile(stylesheetPartialPath, compileFileOptions);
