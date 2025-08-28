import { ServerResponse } from 'node:http';

/**
 * Sends a JSON response with the specified status code and data.
 *
 * @param serverResponse - The HTTP server response object.
 */
export default function sendNotImplementedTextResponse(serverResponse: ServerResponse) {
  serverResponse.statusCode = 501;
  serverResponse.setHeader('Content-Type', 'text/plain');
  serverResponse.end('Not Implemented');
}
