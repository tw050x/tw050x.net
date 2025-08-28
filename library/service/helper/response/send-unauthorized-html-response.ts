import { ServerResponse } from 'node:http';

/**
 * Sends a JSON response with the specified status code and data.
 *
 * @param serverResponse - The HTTP server response object.
 * @param html - The HTML content to send in the response.
 */
export default function sendUnauthorizedHTMLResponse(serverResponse: ServerResponse, html: string) {
  serverResponse.statusCode = 401;
  serverResponse.setHeader('Content-Type', 'text/html');
  serverResponse.end(html);
}
