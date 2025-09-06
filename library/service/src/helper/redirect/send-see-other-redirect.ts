import { ServiceContext } from '../../define-service';


/**
 * Sends a JSON response with the specified status code and data.
 *
 * @param context - The service context object.
 * @param url - The URL to redirect to.
 */
export const sendSeeOtherRedirect = async (context: ServiceContext, url: URL) => {
  let redirectHeader = 'Location'
  if (context.incomingMessage.headers['hx-request'] === 'true') {
    redirectHeader = 'HX-Redirect';
  }
  context.serverResponse.statusCode = 303;
  context.serverResponse.setHeader('Content-Type', 'text/plain');
  context.serverResponse.setHeader(redirectHeader, url.toString());
  context.serverResponse.end('Redirecting...');
}
