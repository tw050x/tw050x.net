import { ServiceRequestContext } from '../../types';


/**
 * Sends a redirection with the 303 status and to the given URL.
 *
 * @param context - The service context object.
 * @param url - The URL to redirect to.
 */
export const sendSeeOtherRedirect = (context: ServiceRequestContext, url: URL) => {
  let redirectHeader = 'Location'
  if (context.incomingMessage.headers['hx-request'] === 'true') {
    redirectHeader = 'HX-Redirect';
  }
  context.serverResponse.statusCode = 303;
  context.serverResponse.setHeader('Content-Type', 'text/plain');
  context.serverResponse.setHeader(redirectHeader, url.toString());
  context.serverResponse.end('Redirecting...');
}
