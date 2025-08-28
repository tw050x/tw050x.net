import { ServerResponse } from 'node:http';

/**
 * Sends an HTML response with the specified status code and html
 *
 * @param serverResponse - The HTTP server response object.
 * @param url - The text content to send in the response.
 */
export default function sendMovedTemporarilyRedirect(serverResponse: ServerResponse, url: URL) {
  serverResponse.statusCode = 302;
  serverResponse.setHeader('Content-Type', 'text/plain');
  serverResponse.setHeader('Location', url.toString());
  serverResponse.end(`Moved Temporarily to ${url.toString()}`);
}
