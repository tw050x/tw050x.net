import { logger } from "./helper/logger.js";
import { NewPropertiesOnly, ServiceRequestContext } from "./types.js";

/**
 * Middleware function type that processes requests
 */
export type Middleware<
  InputContext extends ServiceRequestContext = ServiceRequestContext,
  OutputContext extends ServiceRequestContext = InputContext
> = (
  context: InputContext & Partial<NewPropertiesOnly<InputContext, OutputContext>>
) => Promise<void>;

/**
 * Function that initiates the middleware stack
 */
type MiddlewareStackInitiator<Context> = (context: Context) => Promise<void>;

/**
 * Compose middleware into an event handler function
 * Returns a function compatible with EventEmitter.on() that executes the middleware stack
 * Automatically stops execution if a middleware has already sent a response
 */
export default function defineServiceMiddleware<
  T1 extends ServiceRequestContext
>(
  middlewares: [
    Middleware<ServiceRequestContext, T1>
  ]
): MiddlewareStackInitiator<ServiceRequestContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceRequestContext,
  T2 extends ServiceRequestContext
>(
  middlewares: [
    Middleware<ServiceRequestContext, T1>,
    Middleware<ServiceRequestContext & T1, T2>
  ]
): MiddlewareStackInitiator<ServiceRequestContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceRequestContext,
  T2 extends ServiceRequestContext,
  T3 extends ServiceRequestContext
>(
  middlewares: [
    Middleware<ServiceRequestContext, T1>,
    Middleware<ServiceRequestContext & T1, T2>,
    Middleware<ServiceRequestContext & T1 & T2, T3>
  ]
): MiddlewareStackInitiator<ServiceRequestContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceRequestContext,
  T2 extends ServiceRequestContext,
  T3 extends ServiceRequestContext,
  T4 extends ServiceRequestContext
>(
  middlewares: [
    Middleware<ServiceRequestContext, T1>,
    Middleware<ServiceRequestContext & T1, T2>,
    Middleware<ServiceRequestContext & T1 & T2, T3>,
    Middleware<ServiceRequestContext & T1 & T2 & T3, T4>
  ]
): MiddlewareStackInitiator<ServiceRequestContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceRequestContext,
  T2 extends ServiceRequestContext,
  T3 extends ServiceRequestContext,
  T4 extends ServiceRequestContext,
  T5 extends ServiceRequestContext
>(
  middlewares: [
    Middleware<ServiceRequestContext, T1>,
    Middleware<ServiceRequestContext & T1, T2>,
    Middleware<ServiceRequestContext & T1 & T2, T3>,
    Middleware<ServiceRequestContext & T1 & T2 & T3, T4>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4, T5>
  ]
): MiddlewareStackInitiator<ServiceRequestContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceRequestContext,
  T2 extends ServiceRequestContext,
  T3 extends ServiceRequestContext,
  T4 extends ServiceRequestContext,
  T5 extends ServiceRequestContext,
  T6 extends ServiceRequestContext
>(
  middlewares: [
    Middleware<ServiceRequestContext, T1>,
    Middleware<ServiceRequestContext & T1, T2>,
    Middleware<ServiceRequestContext & T1 & T2, T3>,
    Middleware<ServiceRequestContext & T1 & T2 & T3, T4>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4, T5>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5, T6>
  ]
): MiddlewareStackInitiator<ServiceRequestContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceRequestContext,
  T2 extends ServiceRequestContext,
  T3 extends ServiceRequestContext,
  T4 extends ServiceRequestContext,
  T5 extends ServiceRequestContext,
  T6 extends ServiceRequestContext,
  T7 extends ServiceRequestContext
>(
  middlewares: [
    Middleware<ServiceRequestContext, T1>,
    Middleware<ServiceRequestContext & T1, T2>,
    Middleware<ServiceRequestContext & T1 & T2, T3>,
    Middleware<ServiceRequestContext & T1 & T2 & T3, T4>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4, T5>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5, T6>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6, T7>
  ]
): MiddlewareStackInitiator<ServiceRequestContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceRequestContext,
  T2 extends ServiceRequestContext,
  T3 extends ServiceRequestContext,
  T4 extends ServiceRequestContext,
  T5 extends ServiceRequestContext,
  T6 extends ServiceRequestContext,
  T7 extends ServiceRequestContext,
  T8 extends ServiceRequestContext
>(
  middlewares: [
    Middleware<ServiceRequestContext, T1>,
    Middleware<ServiceRequestContext & T1, T2>,
    Middleware<ServiceRequestContext & T1 & T2, T3>,
    Middleware<ServiceRequestContext & T1 & T2 & T3, T4>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4, T5>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5, T6>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6, T7>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7, T8>
  ]
): MiddlewareStackInitiator<ServiceRequestContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceRequestContext,
  T2 extends ServiceRequestContext,
  T3 extends ServiceRequestContext,
  T4 extends ServiceRequestContext,
  T5 extends ServiceRequestContext,
  T6 extends ServiceRequestContext,
  T7 extends ServiceRequestContext,
  T8 extends ServiceRequestContext,
  T9 extends ServiceRequestContext
>(
  middlewares: [
    Middleware<ServiceRequestContext, T1>,
    Middleware<ServiceRequestContext & T1, T2>,
    Middleware<ServiceRequestContext & T1 & T2, T3>,
    Middleware<ServiceRequestContext & T1 & T2 & T3, T4>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4, T5>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5, T6>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6, T7>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7, T8>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8, T9>
  ]
): MiddlewareStackInitiator<ServiceRequestContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceRequestContext,
  T2 extends ServiceRequestContext,
  T3 extends ServiceRequestContext,
  T4 extends ServiceRequestContext,
  T5 extends ServiceRequestContext,
  T6 extends ServiceRequestContext,
  T7 extends ServiceRequestContext,
  T8 extends ServiceRequestContext,
  T9 extends ServiceRequestContext,
  T10 extends ServiceRequestContext
>(
  middlewares: [
    Middleware<ServiceRequestContext, T1>,
    Middleware<ServiceRequestContext & T1, T2>,
    Middleware<ServiceRequestContext & T1 & T2, T3>,
    Middleware<ServiceRequestContext & T1 & T2 & T3, T4>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4, T5>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5, T6>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6, T7>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7, T8>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8, T9>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9, T10>
  ]
): MiddlewareStackInitiator<ServiceRequestContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceRequestContext,
  T2 extends ServiceRequestContext,
  T3 extends ServiceRequestContext,
  T4 extends ServiceRequestContext,
  T5 extends ServiceRequestContext,
  T6 extends ServiceRequestContext,
  T7 extends ServiceRequestContext,
  T8 extends ServiceRequestContext,
  T9 extends ServiceRequestContext,
  T10 extends ServiceRequestContext,
  T11 extends ServiceRequestContext
>(
  middlewares: [
    Middleware<ServiceRequestContext, T1>,
    Middleware<ServiceRequestContext & T1, T2>,
    Middleware<ServiceRequestContext & T1 & T2, T3>,
    Middleware<ServiceRequestContext & T1 & T2 & T3, T4>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4, T5>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5, T6>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6, T7>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7, T8>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8, T9>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9, T10>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10, T11>
  ]
): MiddlewareStackInitiator<ServiceRequestContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceRequestContext,
  T2 extends ServiceRequestContext,
  T3 extends ServiceRequestContext,
  T4 extends ServiceRequestContext,
  T5 extends ServiceRequestContext,
  T6 extends ServiceRequestContext,
  T7 extends ServiceRequestContext,
  T8 extends ServiceRequestContext,
  T9 extends ServiceRequestContext,
  T10 extends ServiceRequestContext,
  T11 extends ServiceRequestContext,
  T12 extends ServiceRequestContext
>(
  middlewares: [
    Middleware<ServiceRequestContext, T1>,
    Middleware<ServiceRequestContext & T1, T2>,
    Middleware<ServiceRequestContext & T1 & T2, T3>,
    Middleware<ServiceRequestContext & T1 & T2 & T3, T4>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4, T5>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5, T6>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6, T7>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7, T8>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8, T9>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9, T10>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10, T11>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10 & T11, T12>
  ]
): MiddlewareStackInitiator<ServiceRequestContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceRequestContext,
  T2 extends ServiceRequestContext,
  T3 extends ServiceRequestContext,
  T4 extends ServiceRequestContext,
  T5 extends ServiceRequestContext,
  T6 extends ServiceRequestContext,
  T7 extends ServiceRequestContext,
  T8 extends ServiceRequestContext,
  T9 extends ServiceRequestContext,
  T10 extends ServiceRequestContext,
  T11 extends ServiceRequestContext,
  T12 extends ServiceRequestContext,
  T13 extends ServiceRequestContext
>(
  middlewares: [
    Middleware<ServiceRequestContext, T1>,
    Middleware<ServiceRequestContext & T1, T2>,
    Middleware<ServiceRequestContext & T1 & T2, T3>,
    Middleware<ServiceRequestContext & T1 & T2 & T3, T4>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4, T5>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5, T6>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6, T7>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7, T8>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8, T9>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9, T10>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10, T11>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10 & T11, T12>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10 & T11 & T12, T13>
  ]
): MiddlewareStackInitiator<ServiceRequestContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceRequestContext,
  T2 extends ServiceRequestContext,
  T3 extends ServiceRequestContext,
  T4 extends ServiceRequestContext,
  T5 extends ServiceRequestContext,
  T6 extends ServiceRequestContext,
  T7 extends ServiceRequestContext,
  T8 extends ServiceRequestContext,
  T9 extends ServiceRequestContext,
  T10 extends ServiceRequestContext,
  T11 extends ServiceRequestContext,
  T12 extends ServiceRequestContext,
  T13 extends ServiceRequestContext,
  T14 extends ServiceRequestContext
>(
  middlewares: [
    Middleware<ServiceRequestContext, T1>,
    Middleware<ServiceRequestContext & T1, T2>,
    Middleware<ServiceRequestContext & T1 & T2, T3>,
    Middleware<ServiceRequestContext & T1 & T2 & T3, T4>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4, T5>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5, T6>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6, T7>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7, T8>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8, T9>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9, T10>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10, T11>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10 & T11, T12>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10 & T11 & T12, T13>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10 & T11 & T12 & T13, T14>
  ]
): MiddlewareStackInitiator<ServiceRequestContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceRequestContext,
  T2 extends ServiceRequestContext,
  T3 extends ServiceRequestContext,
  T4 extends ServiceRequestContext,
  T5 extends ServiceRequestContext,
  T6 extends ServiceRequestContext,
  T7 extends ServiceRequestContext,
  T8 extends ServiceRequestContext,
  T9 extends ServiceRequestContext,
  T10 extends ServiceRequestContext,
  T11 extends ServiceRequestContext,
  T12 extends ServiceRequestContext,
  T13 extends ServiceRequestContext,
  T14 extends ServiceRequestContext,
  T15 extends ServiceRequestContext
>(
  middlewares: [
    Middleware<ServiceRequestContext, T1>,
    Middleware<ServiceRequestContext & T1, T2>,
    Middleware<ServiceRequestContext & T1 & T2, T3>,
    Middleware<ServiceRequestContext & T1 & T2 & T3, T4>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4, T5>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5, T6>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6, T7>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7, T8>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8, T9>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9, T10>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10, T11>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10 & T11, T12>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10 & T11 & T12, T13>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10 & T11 & T12 & T13, T14>,
    Middleware<ServiceRequestContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10 & T11 & T12 & T13 & T14, T15>
  ]
): MiddlewareStackInitiator<ServiceRequestContext>;
export default function defineServiceMiddleware(
  middlewares: Middleware[]
): MiddlewareStackInitiator<ServiceRequestContext> {
  if (middlewares.length > 15) {
    logger.warn(`defineServiceMiddleware() - Warning: More than 15 middleware functions provided. Only the first 15 have type information.`);
  }
  return async (context) => {
    for (const middleware of middlewares) {
      // Check if response has already been sent
      // Stop executing remaining middleware if response is complete
      if (context.serverResponse.sendingOrSent === true) {
        break;
      }
      await middleware(context);
    }

    // Final check to ensure a response has been sent
    // If no response has been sent by any middleware, send a 500 Internal Server Error response
    if (context.serverResponse.sendingOrSent === false) {
      logger.error('No response sent by middleware stack. Sending 500 Internal Server Error response as fallback.');
      return void context.serverResponse.sendInternalServerErrorTextResponse();
    }
  };
}
