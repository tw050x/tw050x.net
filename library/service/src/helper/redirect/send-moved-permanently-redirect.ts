import { ServiceContext } from '../../define-service';

/**
 * Sends an redirect response to the provided URL
 *
 * @param context - The service context object.
 * @param url - The text content to send in the response.
 */
export const sendMovedPermanentlyRedirect = (context: ServiceContext, url: URL) => {
  let redirectHeader = 'Location'
  if (context.incomingMessage.headers['hx-request'] === 'true') {
    redirectHeader = 'HX-Redirect';
  }
  context.serverResponse.statusCode = 301;
  context.serverResponse.setHeader('Content-Type', 'text/plain');
  context.serverResponse.setHeader(redirectHeader, url.toString());
  context.serverResponse.end(`Moved Permanently to ${url.toString()}`);
}
