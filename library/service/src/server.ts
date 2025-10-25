import { logger } from "@tw050x.net.library/logger";
import { createServer as createHttpServer } from "node:http";
import { default as ContextualIncomingMessage } from "./contextual-incoming-message.js";
import { default as ContextualServerResponse } from "./contextual-server-response.js";
import { default as discoverRoutes } from "./routes.js";
import { CreateRequestHandlerOptions, CreateServerOptions, ServiceRequestContext } from "./types.js";

/**
 * Creates and configures an HTTP server with the specified options.
 *
 * @param options - The server configuration options.
 * @returns The configured HTTP server instance.
 */
export default function createServer(options: CreateServerOptions) {
  const routes = new Map<string, (context: ServiceRequestContext) => void>();

  // Default 404 route
  routes.set('ERROR 404', (context: ServiceRequestContext) => {
    context.serverResponse.writeHead(404, {
      'Content-Type': 'text/plain',
    });
    logger.info(`Not Found: ${context.incomingMessage.method} ${context.incomingMessage.url}`);
    return void context.serverResponse.end('404 page not found');
  });

  // Default healthcheck route
  routes.set('SYSTEM /healthcheck', (context: ServiceRequestContext) => {
    context.serverResponse.writeHead(200, {
      'Content-Type': 'text/plain',
    });
    return void context.serverResponse.end('Healthy');
  });

  const server = createHttpServer({
    IncomingMessage: ContextualIncomingMessage,
    ServerResponse: ContextualServerResponse,
  });

  server.on('request', createRequestHandler({ routes }));

  const close = () => {
    routes.clear(); // this is probably not needed, but just in case
    server.close();
  }

  // Listen for incoming requests
  const listen = (callback: () => void) => {
    server.listen(options.port, callback);
  }

  // Load and register routes
  discoverRoutes(options.routesDirectory).then((discoveredRoutes) => {
    discoveredRoutes.forEach(route => {
      const routePattern = `${route.method} ${route.path}`;
      routes.set(routePattern.trim(), route.middleware);
    });
  });

  return Object.freeze({
    close,
    listen,
  })
}

/**
 * Creates a request handler that processes incoming HTTP requests and routes them to the appropriate handlers based on the configured routes.
 *
 * @param options - The options containing the routes map.
 * @returns
 */
export const createRequestHandler = (options: CreateRequestHandlerOptions) => (incomingMessage: ContextualIncomingMessage, serverResponse: ContextualServerResponse): void => {

  // normalise the method and url
  // remove search params from url for route matching
  const method = incomingMessage.method?.toUpperCase();
  const rawUrl = incomingMessage.url || '';
  const urlPath = new URL(rawUrl, 'http://localhost').pathname;

  // prepare the context object
  const context: ServiceRequestContext = {
    incomingMessage,
    serverResponse,
  }

  // check if the request is a healthcheck
  healthcheckGuard: {
    if (method !== 'GET') break healthcheckGuard;
    if (urlPath !== '/healthcheck') break healthcheckGuard;
    return void options.routes.get('SYSTEM /healthcheck')?.(context);
  }

  // if the url path ends with a trailing slash (and is not just "/"), redirect to the non-trailing slash version
  normaliseUrlGuard: {
    if (urlPath === '/') {
      break normaliseUrlGuard;
    }
    if (urlPath.endsWith('/') === false) {
      break normaliseUrlGuard;
    }

    // construct the replacement URL
    let replacementURL = new URL(urlPath.slice(0, -1), `https://${incomingMessage.headers.host}`);
    if (rawUrl.includes('?')) {
      replacementURL.search = new URL(rawUrl, 'https://localhost').search;
    }
    if (rawUrl.includes('#')) {
      replacementURL.hash = new URL(rawUrl, 'https://localhost').hash;
    }

    // perform the redirect
    serverResponse.writeHead(301, {
      'Location': replacementURL.toString()
    });
    return void serverResponse.end();
  }

  // match to an event name
  // check for exact match first, then wildcard patterns by length
  const requestEventPattern = `${method} ${urlPath}`;
  const routeKeys = Array.from(options.routes.keys());

  // check for exact match first
  // exact matches always take priority over wildcards
  for (const routeKey of routeKeys) {
    if (requestEventPattern === routeKey) {
      return void options.routes.get(routeKey)?.(context);
    }
  }

  // if no exact match found, check wildcard and parameter patterns by length
  // prioritize longer patterns over shorter ones for specificity
  const sortedRouteKeys = routeKeys.slice().sort(
    (a, b) => getSegmentCount(b) - getSegmentCount(a)
  );

  // TODO: the below loop does not account for multiple parameters in the same route
  // e.g., "/users/:id/:action"
  // currently only the first parameter is matched against

  // match either a wildcard or parameter pattern to the available routes using the sorted list
  let matchedRequestWithParametersRouteKey;
  for (const routeKey of sortedRouteKeys) {
    const route = []
    const routeSegments = routeKey.split(' ')[1].split('/');

    let parameters = new Map<string, string>();
    for (const routeSegment of routeSegments) {
      if (routeSegment.startsWith(':') === false) {
        route.push(routeSegment);
        continue;
      }

      const paramName = routeSegment.slice(1);
      const paramValue = urlPath.split('/')[routeSegments.indexOf(routeSegment)];
      parameters.set(paramName, paramValue);
      route.push(paramValue);
    }

    if (route.join('/') === urlPath) {
      matchedRequestWithParametersRouteKey = routeKey;
      break;
    }
  }

  // call the matched request handler
  let routeKey;
  if (matchedRequestWithParametersRouteKey) routeKey = matchedRequestWithParametersRouteKey;
  else routeKey = 'ERROR 404';
  return void options.routes.get(routeKey)?.(context);
}

/**
 * Calculates the number of segments in a route key.
 *
 * @param routeKey - The route name in the format "METHOD /path".
 * @returns The number of segments in the path.
 */
const getSegmentCount = (routeKey: string) => {
  const spaceIdx = routeKey.indexOf(' ');
  const path = spaceIdx >= 0 ? routeKey.slice(spaceIdx + 1) : routeKey;
  return path.split('/').filter(Boolean).length;
};
