import { ServerResponse } from 'node:http';

/**
 * Sends an HTML response with the specified status code and html
 *
 * @param serverResponse - The HTTP server response object.
 * @param text - The text content to send in the response.
 */
export default function sendMovedTemporarilyTextResponse(serverResponse: ServerResponse, text: string) {
  serverResponse.statusCode = 302;
  serverResponse.setHeader('Content-Type', 'text/plain');
  serverResponse.end(text);
}
