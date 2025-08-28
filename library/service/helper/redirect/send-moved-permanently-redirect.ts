import { ServerResponse } from 'node:http';

/**
 * Sends an redirect response to the provided URL
 *
 * @param serverResponse - The HTTP server response object.
 * @param url - The text content to send in the response.
 */
export default function sendMovedPermanentlyRedirect(serverResponse: ServerResponse, url: URL) {
  serverResponse.statusCode = 301;
  serverResponse.setHeader('Content-Type', 'text/plain');
  serverResponse.setHeader('Location', url.toString());
  serverResponse.end(`Moved Permanently to ${url.toString()}`);
}
