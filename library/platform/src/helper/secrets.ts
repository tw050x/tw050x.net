import { logger } from "./logger.js";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CacheEntry {
  value: string;
  timestamp: number;
}

export const CACHE_TTL = 5 * 60 * 1000;
export const cache = new Map<string, CacheEntry>();

/**
 * Reads a cached value from the cache map.
 *
 * @param key - The key to read from the cache
 * @returns the cached value or null if not found or expired
 */
export function readCache(key: string): string | null {
  const now = Date.now();
  const cached = cache.get(key);

  // return cached value if it exists and hasn't expired
  // otherwise return null
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.value;
  }
  return null
}

/**
 * Checks if a secret key exists in the secrets directory.
 *
 * @param key - The key to check for existence in the secrets directory
 * @returns
 */
export const exists = (key: string) => {
  const resolvedPath = resolve(__dirname, '..', '..', '..', '..', '.secrets', key);
  return existsSync(resolvedPath);
}

/**
 * Reads a secret value from the secrets directory.
 *
 * @param key - The key to read from the secrets directory
 * @returns
 */
export const read = (key: string) => {
  if (exists(key) === false) {
    throw new Error(`File not found: ${key}`);
  }

  const resolvedPath = resolve(__dirname, '..', '..', '..', '..', '.secrets', key);

  cacheGuard: {
    const cachedValue = readCache(resolvedPath);

    if (cachedValue === null) {
      logger.debug(`Cache miss for key: ${key}`);
      break cacheGuard
    }

    return cachedValue
  }

  const readValue = readFileSync(resolvedPath, "utf-8").trim();

  cache.set(resolvedPath, {
    value: readValue,
    timestamp: Date.now(),
  });

  return readValue
}

export default {
  exists,
  read,
}
