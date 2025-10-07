import { ServiceRequestContext } from '../../types';




/**
 * Sends a redirect response to the specified URL with a 302 status code.
 *
 * @param context - The service context object.
 * @param url - The URL to redirect to.
 */
export const sendFoundRedirect = (context: ServiceRequestContext, url: URL) => {
  let redirectHeader = 'Location'
  if (context.incomingMessage.headers['hx-request'] === 'true') {
    redirectHeader = 'HX-Redirect';
  }
  context.serverResponse.statusCode = 302
  context.serverResponse.setHeader('Content-Type', 'text/plain');
  context.serverResponse.setHeader(redirectHeader, url.toString());
  context.serverResponse.end('Redirecting...');
}
