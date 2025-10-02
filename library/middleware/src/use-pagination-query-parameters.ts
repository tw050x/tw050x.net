import { Parameter, isParameter } from "@tw050x.net.library/configuration";
import { Middleware, ServiceContext } from "@tw050x.net.library/service";

/**
 *
 */
export type UsePaginationQueryParametersOptions = {
  defaultPageIndex: string | Parameter;
  defaultPageSize: string | Parameter;
}

/**
 *
 */
export type UsePaginationQueryParametersResultingContext = ServiceContext & {
  incomingMessage: ServiceContext['incomingMessage'] & {
    queryParameters: {
      pi: string
      ps: string
    }
  }
}

/**
 *
 */
type Factory = (options: UsePaginationQueryParametersOptions) => Middleware<
  ServiceContext,
  UsePaginationQueryParametersResultingContext
>

/**
 *
 */
export const usePaginationQueryParameters: Factory = (options) => async (context) => {

  if (isParameter(options.defaultPageIndex)) {

  }


  console.log(options);
  console.log(context);
};
