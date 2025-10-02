import { logger } from "@tw050x.net.library/logger";
import { NewPropertiesOnly } from "@tw050x.net.library/types";
import { ServiceContext } from "./define-service";

/**
 * Middleware function type that processes requests
 */
export type Middleware<
  InputContext extends ServiceContext = ServiceContext,
  OutputContext extends ServiceContext = InputContext
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
export default function defineServiceMiddleware<T1 extends ServiceContext>(
  middlewares: [
    Middleware<ServiceContext, T1>
  ]
): MiddlewareStackInitiator<ServiceContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceContext,
  T2 extends ServiceContext
>(
  middlewares: [
    Middleware<ServiceContext, T1>,
    Middleware<ServiceContext & T1, T2>
  ]
): MiddlewareStackInitiator<ServiceContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceContext,
  T2 extends ServiceContext,
  T3 extends ServiceContext
>(
  middlewares: [
    Middleware<ServiceContext, T1>,
    Middleware<ServiceContext & T1, T2>,
    Middleware<ServiceContext & T1 & T2, T3>
  ]
): MiddlewareStackInitiator<ServiceContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceContext,
  T2 extends ServiceContext,
  T3 extends ServiceContext,
  T4 extends ServiceContext
>(
  middlewares: [
    Middleware<ServiceContext, T1>,
    Middleware<ServiceContext & T1, T2>,
    Middleware<ServiceContext & T1 & T2, T3>,
    Middleware<ServiceContext & T1 & T2 & T3, T4>
  ]
): MiddlewareStackInitiator<ServiceContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceContext,
  T2 extends ServiceContext,
  T3 extends ServiceContext,
  T4 extends ServiceContext,
  T5 extends ServiceContext
>(
  middlewares: [
    Middleware<ServiceContext, T1>,
    Middleware<ServiceContext & T1, T2>,
    Middleware<ServiceContext & T1 & T2, T3>,
    Middleware<ServiceContext & T1 & T2 & T3, T4>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4, T5>
  ]
): MiddlewareStackInitiator<ServiceContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceContext,
  T2 extends ServiceContext,
  T3 extends ServiceContext,
  T4 extends ServiceContext,
  T5 extends ServiceContext,
  T6 extends ServiceContext
>(
  middlewares: [
    Middleware<ServiceContext, T1>,
    Middleware<ServiceContext & T1, T2>,
    Middleware<ServiceContext & T1 & T2, T3>,
    Middleware<ServiceContext & T1 & T2 & T3, T4>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4, T5>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5, T6>
  ]
): MiddlewareStackInitiator<ServiceContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceContext,
  T2 extends ServiceContext,
  T3 extends ServiceContext,
  T4 extends ServiceContext,
  T5 extends ServiceContext,
  T6 extends ServiceContext,
  T7 extends ServiceContext
>(
  middlewares: [
    Middleware<ServiceContext, T1>,
    Middleware<ServiceContext & T1, T2>,
    Middleware<ServiceContext & T1 & T2, T3>,
    Middleware<ServiceContext & T1 & T2 & T3, T4>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4, T5>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5, T6>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6, T7>
  ]
): MiddlewareStackInitiator<ServiceContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceContext,
  T2 extends ServiceContext,
  T3 extends ServiceContext,
  T4 extends ServiceContext,
  T5 extends ServiceContext,
  T6 extends ServiceContext,
  T7 extends ServiceContext,
  T8 extends ServiceContext
>(
  middlewares: [
    Middleware<ServiceContext, T1>,
    Middleware<ServiceContext & T1, T2>,
    Middleware<ServiceContext & T1 & T2, T3>,
    Middleware<ServiceContext & T1 & T2 & T3, T4>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4, T5>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5, T6>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6, T7>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7, T8>
  ]
): MiddlewareStackInitiator<ServiceContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceContext,
  T2 extends ServiceContext,
  T3 extends ServiceContext,
  T4 extends ServiceContext,
  T5 extends ServiceContext,
  T6 extends ServiceContext,
  T7 extends ServiceContext,
  T8 extends ServiceContext,
  T9 extends ServiceContext
>(
  middlewares: [
    Middleware<ServiceContext, T1>,
    Middleware<ServiceContext & T1, T2>,
    Middleware<ServiceContext & T1 & T2, T3>,
    Middleware<ServiceContext & T1 & T2 & T3, T4>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4, T5>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5, T6>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6, T7>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7, T8>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8, T9>
  ]
): MiddlewareStackInitiator<ServiceContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceContext,
  T2 extends ServiceContext,
  T3 extends ServiceContext,
  T4 extends ServiceContext,
  T5 extends ServiceContext,
  T6 extends ServiceContext,
  T7 extends ServiceContext,
  T8 extends ServiceContext,
  T9 extends ServiceContext,
  T10 extends ServiceContext
>(
  middlewares: [
    Middleware<ServiceContext, T1>,
    Middleware<ServiceContext & T1, T2>,
    Middleware<ServiceContext & T1 & T2, T3>,
    Middleware<ServiceContext & T1 & T2 & T3, T4>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4, T5>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5, T6>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6, T7>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7, T8>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8, T9>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9, T10>
  ]
): MiddlewareStackInitiator<ServiceContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceContext,
  T2 extends ServiceContext,
  T3 extends ServiceContext,
  T4 extends ServiceContext,
  T5 extends ServiceContext,
  T6 extends ServiceContext,
  T7 extends ServiceContext,
  T8 extends ServiceContext,
  T9 extends ServiceContext,
  T10 extends ServiceContext,
  T11 extends ServiceContext
>(
  middlewares: [
    Middleware<ServiceContext, T1>,
    Middleware<ServiceContext & T1, T2>,
    Middleware<ServiceContext & T1 & T2, T3>,
    Middleware<ServiceContext & T1 & T2 & T3, T4>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4, T5>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5, T6>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6, T7>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7, T8>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8, T9>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9, T10>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10, T11>
  ]
): MiddlewareStackInitiator<ServiceContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceContext,
  T2 extends ServiceContext,
  T3 extends ServiceContext,
  T4 extends ServiceContext,
  T5 extends ServiceContext,
  T6 extends ServiceContext,
  T7 extends ServiceContext,
  T8 extends ServiceContext,
  T9 extends ServiceContext,
  T10 extends ServiceContext,
  T11 extends ServiceContext,
  T12 extends ServiceContext
>(
  middlewares: [
    Middleware<ServiceContext, T1>,
    Middleware<ServiceContext & T1, T2>,
    Middleware<ServiceContext & T1 & T2, T3>,
    Middleware<ServiceContext & T1 & T2 & T3, T4>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4, T5>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5, T6>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6, T7>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7, T8>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8, T9>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9, T10>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10, T11>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10 & T11, T12>
  ]
): MiddlewareStackInitiator<ServiceContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceContext,
  T2 extends ServiceContext,
  T3 extends ServiceContext,
  T4 extends ServiceContext,
  T5 extends ServiceContext,
  T6 extends ServiceContext,
  T7 extends ServiceContext,
  T8 extends ServiceContext,
  T9 extends ServiceContext,
  T10 extends ServiceContext,
  T11 extends ServiceContext,
  T12 extends ServiceContext,
  T13 extends ServiceContext
>(
  middlewares: [
    Middleware<ServiceContext, T1>,
    Middleware<ServiceContext & T1, T2>,
    Middleware<ServiceContext & T1 & T2, T3>,
    Middleware<ServiceContext & T1 & T2 & T3, T4>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4, T5>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5, T6>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6, T7>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7, T8>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8, T9>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9, T10>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10, T11>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10 & T11, T12>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10 & T11 & T12, T13>
  ]
): MiddlewareStackInitiator<ServiceContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceContext,
  T2 extends ServiceContext,
  T3 extends ServiceContext,
  T4 extends ServiceContext,
  T5 extends ServiceContext,
  T6 extends ServiceContext,
  T7 extends ServiceContext,
  T8 extends ServiceContext,
  T9 extends ServiceContext,
  T10 extends ServiceContext,
  T11 extends ServiceContext,
  T12 extends ServiceContext,
  T13 extends ServiceContext,
  T14 extends ServiceContext
>(
  middlewares: [
    Middleware<ServiceContext, T1>,
    Middleware<ServiceContext & T1, T2>,
    Middleware<ServiceContext & T1 & T2, T3>,
    Middleware<ServiceContext & T1 & T2 & T3, T4>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4, T5>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5, T6>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6, T7>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7, T8>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8, T9>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9, T10>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10, T11>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10 & T11, T12>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10 & T11 & T12, T13>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10 & T11 & T12 & T13, T14>
  ]
): MiddlewareStackInitiator<ServiceContext>;
export default function defineServiceMiddleware<
  T1 extends ServiceContext,
  T2 extends ServiceContext,
  T3 extends ServiceContext,
  T4 extends ServiceContext,
  T5 extends ServiceContext,
  T6 extends ServiceContext,
  T7 extends ServiceContext,
  T8 extends ServiceContext,
  T9 extends ServiceContext,
  T10 extends ServiceContext,
  T11 extends ServiceContext,
  T12 extends ServiceContext,
  T13 extends ServiceContext,
  T14 extends ServiceContext,
  T15 extends ServiceContext
>(
  middlewares: [
    Middleware<ServiceContext, T1>,
    Middleware<ServiceContext & T1, T2>,
    Middleware<ServiceContext & T1 & T2, T3>,
    Middleware<ServiceContext & T1 & T2 & T3, T4>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4, T5>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5, T6>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6, T7>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7, T8>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8, T9>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9, T10>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10, T11>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10 & T11, T12>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10 & T11 & T12, T13>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10 & T11 & T12 & T13, T14>,
    Middleware<ServiceContext & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10 & T11 & T12 & T13 & T14, T15>
  ]
): MiddlewareStackInitiator<ServiceContext>;
export default function defineServiceMiddleware(
  middlewares: Middleware[]
): MiddlewareStackInitiator<ServiceContext> {
  if (middlewares.length > 15) {
    logger.warn(`defineServiceMiddleware() - Warning: More than 15 middleware functions provided. Only the first 15 have type information.`);
  }
  return async (context) => {
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
