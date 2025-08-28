import { ServerResponse } from 'node:http';

/**
 * Sends an HTML response with the specified status code and html
 *
 * @param serverResponse - The HTTP server response object.
 * @param html - The HTML content to send in the response.
 */
export default function sendForbiddenHTMLResponse(serverResponse: ServerResponse, html: string) {
  serverResponse.statusCode = 403;
  serverResponse.setHeader('Content-Type', 'text/html');
  serverResponse.end(html);
}
