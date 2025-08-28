import { ServerResponse } from 'node:http';


/**
 * Sends a JSON response with the specified status code and data.
 *
 * @param serverResponse - The HTTP server response object.
 * @param url - The URL to redirect to.
 */
export default function sendSeeOtherRedirect(serverResponse: ServerResponse, url: URL) {
  serverResponse.statusCode = 303;
  serverResponse.setHeader('Content-Type', 'text/plain');
  serverResponse.setHeader('HX-Redirect', url.toString());
  serverResponse.end('Redirecting...');
}
