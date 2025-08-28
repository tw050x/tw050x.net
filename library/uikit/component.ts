import { resolve } from "node:path";
import { Options, compileFile } from "pug";

// Options
const compileFileOptions: Options = {
  basedir: resolve(__dirname, './component'),
}

// Paths
export const formFieldCronExpressionCreateComponentPath = resolve(__dirname, './component/form-field--cron-expression--create.pug');
export const formFieldCronExpressionReadComponentPath = resolve(__dirname, './component/form-field--cron-expression--read.pug');
export const formFieldCronExpressionUpdateComponentPath = resolve(__dirname, './component/form-field--cron-expression--update.pug');
export const formFieldGroupComponentPath = resolve(__dirname, './component/form-field-group.pug');
export const formFieldSwitchCreateComponentPath = resolve(__dirname, './component/form-field--switch--create.pug');
export const formFieldSwitchUpdateComponentPath = resolve(__dirname, './component/form-field--switch--update.pug');
export const formFieldTextCreateComponentPath = resolve(__dirname, './component/form-field--text--create.pug');
export const formFieldTextReadComponentPath = resolve(__dirname, './component/form-field--text--read.pug');
export const formFieldTextUpdateComponentPath = resolve(__dirname, './component/form-field--text--update.pug');
export const formFieldTextareaCreateComponentPath = resolve(__dirname, './component/form-field--textarea--create.pug');
export const formFieldTextareaReadComponentPath = resolve(__dirname, './component/form-field--textarea--read.pug');
export const formFieldTextareaUpdateComponentPath = resolve(__dirname, './component/form-field--textarea--update.pug');
export const noticeContainedErrorComponentPath = resolve(__dirname, './component/notice--contained--error.pug');
export const noticeContainedInfoComponentPath = resolve(__dirname, './component/notice--contained--info.pug');
export const titleWithActionsComponentPath = resolve(__dirname, './component/title-with-actions.pug');
export const titleComponentPath = resolve(__dirname, './component/title.pug');

// Compiled files
export const formFieldGroupComponent = compileFile(formFieldGroupComponentPath, compileFileOptions)
export const formFieldCronExpressionCreateComponent = compileFile(formFieldCronExpressionCreateComponentPath, compileFileOptions)
export const formFieldCronExpressionReadComponent = compileFile(formFieldCronExpressionReadComponentPath, compileFileOptions)
export const formFieldCronExpressionUpdateComponent = compileFile(formFieldCronExpressionUpdateComponentPath, compileFileOptions)
export const formFieldSwitchCreateComponent = compileFile(formFieldSwitchCreateComponentPath, compileFileOptions)
export const formFieldSwitchUpdateComponent = compileFile(formFieldSwitchUpdateComponentPath, compileFileOptions)
export const formFieldTextCreateComponent = compileFile(formFieldTextCreateComponentPath, compileFileOptions)
export const formFieldTextReadComponent = compileFile(formFieldTextReadComponentPath, compileFileOptions)
export const formFieldTextUpdateComponent = compileFile(formFieldTextUpdateComponentPath, compileFileOptions)
export const formFieldTextareaCreateComponent = compileFile(formFieldTextareaCreateComponentPath, compileFileOptions)
export const formFieldTextareaReadComponent = compileFile(formFieldTextareaReadComponentPath, compileFileOptions)
export const formFieldTextareaUpdateComponent = compileFile(formFieldTextareaUpdateComponentPath, compileFileOptions)
export const noticeContainedErrorComponent = compileFile(noticeContainedErrorComponentPath, compileFileOptions)
export const noticeContainedInfoComponent = compileFile(noticeContainedInfoComponentPath, compileFileOptions)
export const titleWithActionsComponent = compileFile(titleWithActionsComponentPath, compileFileOptions)
export const titleComponent = compileFile(titleComponentPath, compileFileOptions)
