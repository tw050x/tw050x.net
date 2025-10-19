import { Parameter, isParameter, readParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";

/**
 *
 */
export type UsePaginationQueryParametersOptions = {
  defaultPageIndex: number | Parameter;
  defaultPageSize: number | Parameter;
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
  let defaultPageIndex: number;
  let defaultPageSize: number;

  if (isParameter(options.defaultPageIndex)) {
    try {
      defaultPageIndex = Number(await readParameter(options.defaultPageIndex.key));
    }
    catch (error) {
      logger.error(error);
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />)
    }
  }
  else {
    defaultPageIndex = options.defaultPageIndex;
  }

  if (isParameter(options.defaultPageSize)) {
    try {
      defaultPageSize = Number(await readParameter(options.defaultPageSize.key));
    }
    catch (error) {
      logger.error(error);
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />)
    }
  }
  else {
    defaultPageSize = options.defaultPageSize;
  }

  if (isNaN(defaultPageIndex) || defaultPageIndex < 0) {
    logger.error(new Error('The default page index must be a non-negative number'));
    return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />)
  }

  if (isNaN(defaultPageSize) || defaultPageSize <= 0) {
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
      replacementURL.searchParams.set('pi', String(defaultPageIndex));
    }
    if (pageSizeUrlQueryValue === null) {
      replacementURL.searchParams.set('ps', String(defaultPageSize));
    }
    context.serverResponse.writeHead(301, {
      'Location': replacementURL.toString()
    });
    return void context.serverResponse.end();
  }

  context.incomingMessage.query = {
    parameters: {
      pageIndex: Number(pageIndexUrlQueryValue) || defaultPageIndex,
      pageSize: Number(pageSizeUrlQueryValue) || defaultPageSize,
    }
  };
};
