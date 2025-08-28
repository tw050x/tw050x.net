import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

interface DiscoveredRoute {
  method: string;
  path: string;
  middleware: any;
}

/**
 * Recursively discovers routes from a stack directory structure.
 * Expects files named with HTTP methods (get.ts, post.ts, etc.) in subdirectories
 * that represent URL paths. Directories starting with ':' are treated as parameters.
 *
 * Directory structure mapping:
 * - stack/get.ts -> GET /
 * - stack/login/get.ts -> GET /login
 * - stack/login/post.ts -> POST /login
 * - stack/api/users/get.ts -> GET /api/users
 * - stack/api/users/post.ts -> POST /api/users
 * - stack/api/users/:id/get.ts -> GET /api/users/:id
 * - stack/api/users/:id/posts/:postId/get.ts -> GET /api/users/:id/posts/:postId
 *
 * @param options Configuration options including stackDirectory path
 * @returns Array of discovered routes with method, path, and middleware
 */
export default async function discoverRoutes(directory: string): Promise<DiscoveredRoute[]> {
  const routes: DiscoveredRoute[] = [];
  const validMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];

  // use a queue to track directories to process
  // each item contains the directory path and corresponding URL path
  const directoryQueue: Array<{ path: string; urlPath: string }> = [
    { path: directory, urlPath: '' }
  ];

  while (directoryQueue.length > 0) {
    const { path: currentPath, urlPath } = directoryQueue.shift()!;

    try {
      const entries = readdirSync(currentPath);

      for (const entry of entries) {

        const entryPath = join(currentPath, entry);
        const stat = statSync(entryPath);

        if (stat.isDirectory()) {
          // add subdirectory to queue for processing
          // build URL path from directory structure, handling parameters
          const pathSegment = entry.startsWith(':') ? entry : entry;
          const newUrlPath = urlPath + '/' + pathSegment;
          directoryQueue.push({ path: entryPath, urlPath: newUrlPath });
        }
        else if (stat.isFile() && (entry.endsWith('.ts') || entry.endsWith('.js'))) {
          // check if file is a valid HTTP method
          const methodName = entry.replace(/\.(ts|js)$/, '').toLowerCase();
          if (validMethods.includes(methodName)) {
            try {

              // dynamically import the middleware stack
              const importPath = pathToFileURL(entryPath).href;
              const middlewareModule = await import(importPath);
              const middleware = middlewareModule.default || middlewareModule;

              // construct the full route
              const method = methodName.toUpperCase();
              const path = urlPath || '/';

              routes.push({
                method,
                path,
                middleware
              });
            } catch (error) {
              console.warn(`Failed to load middleware from ${entryPath}:`, error);
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to read directory ${currentPath}:`, error);
    }
  }

  return routes;
}
