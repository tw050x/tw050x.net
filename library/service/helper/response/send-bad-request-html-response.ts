import { ServerResponse } from 'node:http';

/**
 * Sends a JSON response with the specified status code and data.
 *
 * @param serverResponse - The HTTP server response object.
 */
export default function sendBadRequestHTMLResponse(serverResponse: ServerResponse, html: string) {
  serverResponse.statusCode = 400;
  serverResponse.setHeader('Content-Type', 'text/html');
  serverResponse.end(html);
}
