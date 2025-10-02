import { LRUCache } from "lru-cache";

/**
 * A simple in-memory LRU cache to store configuration values fetched from AWS SSM Parameter Store.
 */
export const cache = new LRUCache<string, string>({
  maxSize: 100_000,
  sizeCalculation: (n) => n.length,
  ttl: 5 * 60 * 1000,
});
