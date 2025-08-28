import { ServerResponse } from 'node:http';

/**
 * Sends an HTML response with the specified status code and data.
 *
 * @param serverResponse - The HTTP server response object.
 * @param text - The plain text content to send in the response.
 */
export default function sendOKTextResponse(serverResponse: ServerResponse, text: string) {
  serverResponse.statusCode = 200;
  serverResponse.setHeader('Content-Type', 'text/plain');
  serverResponse.end(text);
}
