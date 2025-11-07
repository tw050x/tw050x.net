import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from 'node:url';
import { minify_sync } from "terser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// In-memory cache for loaded scripts
const cache = new Map<string, string>();

/**
 * Loads and minifies a JavaScript script from the scripts directory.
 *
 * @param scriptName - The name of the script (without .js extension)
 * @returns The minified script content as a string
 */
const readScript = (scriptName: string): string | undefined => {
  if (cache.has(scriptName)) {
    return cache.get(scriptName);
  }

  const scriptPath = resolve(__dirname, "script", `${scriptName}.js`);
  const scriptContent = readFileSync(scriptPath, "utf8");
  const minified = minify_sync(scriptContent);
  const code = minified.code;

  if (code === undefined) {
    return undefined;
  }

  // remove all occurances of "export {};" from the code
  const cleanedCode = code.replace(/export\s*{\s*};?/g, '');

  cache.set(scriptName, cleanedCode);
  return cleanedCode;
}
export default readScript;
