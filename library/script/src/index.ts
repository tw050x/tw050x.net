import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { minify_sync } from "terser";

// In-memory cache for loaded scripts
const cache = new Map<string, string>();

/**
 * Loads and minifies a JavaScript script from the scripts directory.
 *
 * @param scriptName - The name of the script (without .js extension)
 * @returns The minified script content as a string
 */
export const readScript = (scriptName: string, replacements?: Record<string, string>): string | undefined => {
  if (cache.has(scriptName)) {
    return cache.get(scriptName);
  }

  const scriptPath = resolve(__dirname, "files", `${scriptName}.js`);
  const scriptContent = readFileSync(scriptPath, "utf8");
  const minified = minify_sync(scriptContent);

  let code = minified.code;

  if (code === undefined) {
    return undefined;
  }

  if (replacements !== undefined) {
    code = Object.entries(replacements).reduce((acc, [key, value]) => {
      return acc.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }, code);
  }

  cache.set(scriptName, code);
  return code;
}
