import { logger } from "@tw050x.net.library/logger";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";

/**
 *
 */
export type UsePaginationQueryParametersOptions = {
  defaultPageIndex: string;
  defaultPageSize: string;
}

/**
 *
 */
type Parameters = {
  pageIndex: number
  pageSize: number
}

/**
 *
 */
export type UsePaginationQueryParametersResultingContext = ServiceRequestContext & {
  incomingMessage: ServiceRequestContext['incomingMessage'] & {
    query: {
      parameters: Parameters
    }
  }
}

/**
 *
 */
type Factory = (options: UsePaginationQueryParametersOptions) => Middleware<
  ServiceRequestContext,
  UsePaginationQueryParametersResultingContext
>

/**
 *
 */
export const usePaginationQueryParameters: Factory = (options) => async (context) => {
  if (isNaN(Number(options.defaultPageIndex)) || Number(options.defaultPageIndex) < 0) {
    logger.error(new Error('The default page index must be a non-negative number'));
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />)
  }

  if (isNaN(Number(options.defaultPageSize)) || Number(options.defaultPageSize) <= 0) {
    logger.error(new Error('The default page size must be a positive number'));
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />)
  }

  if (context.incomingMessage.url === undefined) {
    logger.error(new Error('The incoming request URL is undefined'));
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />)
  }

  const urlQuery = new URLSearchParams(context.incomingMessage.url.split('?')[1]);

  const pageIndexUrlQueryValue = urlQuery.get('pi');
  const pageSizeUrlQueryValue = urlQuery.get('ps');

  if (pageIndexUrlQueryValue === null || pageSizeUrlQueryValue === null) {
    const replacementURL = new URL(context.incomingMessage.url, `https://${context.incomingMessage.headers.host}`);
    if (pageIndexUrlQueryValue === null) {
      replacementURL.searchParams.set('pi', String(options.defaultPageIndex));
    }
    if (pageSizeUrlQueryValue === null) {
      replacementURL.searchParams.set('ps', String(options.defaultPageSize));
    }
    return void context.serverResponse.sendMovedPermanentlyRedirect(replacementURL);
  }

  context.incomingMessage.query = {
    parameters: {
      pageIndex: Number(pageIndexUrlQueryValue) || Number(options.defaultPageIndex),
      pageSize: Number(pageSizeUrlQueryValue) || Number(options.defaultPageSize),
    }
  };
};
