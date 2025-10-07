import { ServiceRequestContext } from '../../types';

/**
 * Sends an HTML response with the specified status code and html
 *
 * @param context - The service context object.
 * @param url - The text content to send in the response.
 */
export const sendMovedTemporarilyRedirect = (context: ServiceRequestContext, url: URL) => {
  let redirectHeader = 'Location'
  if (context.incomingMessage.headers['hx-request'] === 'true') {
    redirectHeader = 'HX-Redirect';
  }
  context.serverResponse.statusCode = 302;
  context.serverResponse.setHeader('Content-Type', 'text/plain');
  context.serverResponse.setHeader(redirectHeader, url.toString());
  context.serverResponse.end(`Moved Temporarily to ${url.toString()}`);
}
