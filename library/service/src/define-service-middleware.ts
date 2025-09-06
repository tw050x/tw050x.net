import { ServiceContext } from "./define-service";

/**
 * Middleware function that processes requests
 * Used to build composable request handling chains
 */
type Middleware = (
  context: ServiceContext
) => Promise<void>;

/**
 * Compose middleware into an event handler function
 * Returns a function compatible with EventEmitter.on() that executes the middleware stack
 * Automatically stops execution if a middleware has already sent a response
 */
export default function defineServiceMiddleware(middlewares: Middleware[]) {
  return async (context: ServiceContext) => {
    for (const middleware of middlewares) {
      // Check if response has already been sent
      // Stop executing remaining middleware if response is complete
      if (context.serverResponse.headersSent || context.serverResponse.writableEnded) {
        break;
      }

      await middleware(context);
    }
  };
}
