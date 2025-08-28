import { ServerResponse } from 'node:http';

/**
 * Sends an HTML response with the specified status code and html
 *
 * @param serverResponse - The HTTP server response object.
 * @param html - The HTML content to send in the response.
 */
export default function sendInternalServerErrorHTMLResponse(serverResponse: ServerResponse, html: string) {
  serverResponse.statusCode = 500;
  serverResponse.setHeader('Content-Type', 'text/html');
  serverResponse.end(html);
}
