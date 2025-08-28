import { ServerResponse } from 'node:http';




/**
 * Sends a redirect response to the specified URL with a 302 status code.
 *
 * @param serverResponse - The HTTP server response object.
 * @param url - The URL to redirect to.
 */
export default function sendFoundRedirect(serverResponse: ServerResponse, url: URL) {
  serverResponse.statusCode = 302
  serverResponse.setHeader('Content-Type', 'text/plain');
  serverResponse.setHeader('Location', url.toString());
  serverResponse.end('Redirecting...');
}
