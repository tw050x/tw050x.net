import { logger } from "../../logger/src"
import { GetSecretValueCommand } from "@aws-sdk/client-secrets-manager"
import { GetParameterCommand } from "@aws-sdk/client-ssm"
import { EventEmitter } from "node:events";
import { IncomingMessage, ServerResponse, createServer } from "node:http";
import { default as discoverRoutes } from "./routes";
import { ssmClient } from "./ssm-client";
import { secretsManagerClient } from "./secrets-manager-client";
import { mongoClient } from "./mongo-client";

export type Service = {
  close: (callback?: () => void) => void;
  configuration: {
    destroy: () => Promise<void>;
    use: (key: string) => void;
  },
  database: {
    destroy: () => Promise<void>;
  },
  listen: (port: number | string, callback?: () => void) => void;
  on: (event: string, listener: (...args: any[]) => void) => void;
  secrets: {
    destroy: () => Promise<void>;
    use: (key: string) => void;
  }
}

interface ServiceConfiguration {
  getRoutesDirectory: () => string;
  onPrepare?: (service: Service) => Promise<void>;
  onReady?: (service: Service) => Promise<void>;
}

export type ServiceContext = {
  configuration: {
    get: (key: string) => string;
  };
  incomingMessage: IncomingMessage;
  secrets: {
    get: (key: string) => string;
  };
  serverResponse: ServerResponse;
}

/**
 * Defines a service with a directory structure for routes.
 */
export default async function defineService({ getRoutesDirectory, onPrepare, onReady }: ServiceConfiguration) {
  const eventEmitter = new EventEmitter();

  const configuration = new Map<string, string>();
  const secrets = new Map<string, string>();

  function requestHandler(incomingMessage: IncomingMessage, serverResponse: ServerResponse) {

    // normalise the method and url
    // remove search params from url for route matching
    const method = incomingMessage.method?.toUpperCase();
    const rawUrl = incomingMessage.url || '';
    const urlPath = new URL(rawUrl, 'http://localhost').pathname;

    // check if the request is a healthcheck
    healthcheckGuard: {
      if (method !== 'GET') break healthcheckGuard;
      if (urlPath !== '/healthcheck') break healthcheckGuard;
      serverResponse.writeHead(200, {
        'Content-Type': 'text/plain',
      });
      return void serverResponse.end('Healthy');
    }

    // match to an event name
    // check for exact match first, then wildcard patterns by length
    const requestEventPattern = `${method} ${urlPath}`;
    const eventEmitterEventNames = eventEmitter.eventNames() as string[];
    let matchedEventPattern;

    // check for exact match first
    // exact matches always take priority over wildcards
    for (const eventName of eventEmitterEventNames) {
      const eventNameEventString = eventName.toString();
      if (requestEventPattern === eventNameEventString) {
        matchedEventPattern = requestEventPattern;
        break;
      }
    }

    // if no exact match found, check wildcard and parameter patterns by length
    // prioritize longer patterns over shorter ones for specificity
    if (matchedEventPattern === undefined) {
      const sortedEventEmitterEventNames = eventEmitterEventNames.slice().sort((a, b) => b.length - a.length);

      for (const eventName of sortedEventEmitterEventNames) {
        const eventNameEventString = eventName.toString();

        // throw error for events that don't contain a space (method and path required)
        // enforce that all event names must have method and URL path
        if (eventNameEventString.includes(' /') === false) {
          throw new Error(`Invalid route pattern: "${eventNameEventString}". Routes must include both method and path (e.g. "GET /users" or "POST /api/*"). The path must start with a "/".`);
        }

        // parameter pattern match (e.g., "/users/:id" matches "/users/123")
        if (eventNameEventString.includes(':')) {
          const regexPattern = eventNameEventString.replace(/:[^/\s]+/g, '[^/]+');
          const regex = new RegExp(`^${regexPattern}$`);
          if (regex.test(requestEventPattern)) {
            matchedEventPattern = eventNameEventString;
            break;
          }
        }
        // wildcard pattern match
        else if (eventNameEventString.includes('*')) {
          const regexPattern = eventNameEventString.replace(/\*/g, '.+');
          const regex = new RegExp(`^${regexPattern}$`);
          if (regex.test(requestEventPattern)) {
            matchedEventPattern = eventNameEventString;
            break;
          }
        }
      }
    }

    // emit the matched event
    // pass request and response to the handler
    if (matchedEventPattern) {
      const context: ServiceContext = {
        configuration: {
          get: (key: string) => {
            const value = configuration.get(key);
            if (value === undefined) {
              throw new Error(`Configuration key (${key}) not found, did you forget to call service.configuration.use(${key}) in the service onPrepare() function?`);
            }
            return value;
          }
        },
        incomingMessage,
        secrets: {
          get: (key: string) => {
            const value = secrets.get(key);
            if (value === undefined) {
              throw new Error(`Secret key (${key}) not found, did you forget to call service.secrets.use(${key}) in the service onPrepare() function?`);
            }
            return value;
          }
        },
        serverResponse,
      }
      return void eventEmitter.emit(matchedEventPattern, context);
    }

    // if no event matched, return 404 Not Found
    serverResponse.writeHead(404, {
      'Content-Type': 'text/plain',
    });
    console.log(`Not Found: ${method} ${urlPath}`);
    return void serverResponse.end('404 page not found');
  }

  // discover routes from stack directory if provided
  const routesToRegister = await discoverRoutes(getRoutesDirectory());

  // register routes
  routesToRegister.forEach(route => {
    const routePattern = `${route.method} ${route.path}`;
    eventEmitter.on(routePattern.trim(), route.middleware);
  });

  const server = createServer(requestHandler);

  const service: Service = {
    configuration: {
      destroy: async () => {
        ssmClient.destroy();
      },
      use: async (key: string) => {
        const cachedValue = configuration.get(key);
        if (cachedValue === null) {
          return cachedValue
        }
        let readValue;

        try {
          readValue = await ssmClient.send(
            new GetParameterCommand({
              Name: key,
              WithDecryption: false
            })
          );
        }
        catch (error) {
          logger.error(`Error occurred while reading SSM parameter "${key}"`, { error });
          throw new Error('Failed to read SSM parameter');
        }

        let value = readValue.Parameter?.Value

        if (value !== undefined) {
          configuration.set(key, value);
        }
      }
    },
    close: (callback) => {
      server.close(callback);
    },
    database: {
      destroy: async () => {
        await mongoClient.close();
      }
    },
    listen: (port, callback) => {
      server.listen(port, callback);
    },
    on: (event, listener) => {
      eventEmitter.on(event, listener);
    },
    secrets: {
      destroy: async () => {
        secretsManagerClient.destroy();
      },
      use: async (key: string) => {
        const cachedValue = secrets.get(key);
        if (cachedValue === null) {
          return cachedValue
        }
        let readValue;

        try {
          readValue = await secretsManagerClient.send(
            new GetSecretValueCommand({
              SecretId: key
            })
          );
        }
        catch (error) {
          logger.error(`Error occurred while reading secret value "${key}"`, { error });
          throw new Error('Failed to read secret value');
        }

        let value = readValue.SecretString

        if (value !== undefined) {
          secrets.set(key, value);
        }
      },
    },
  }

  try {
    await onPrepare?.(service);
  }
  catch (error) {
    logger.error('Error occurred during service preparation', { error });
    logger.info('Exiting process');
    process.exit(1);
  }

  try {
    await onReady?.(service);
  }
  catch (error) {
    logger.error('Error occurred during service readiness', { error });
    logger.info('Exiting process');
    process.exit(1);
  }
}
