import { ServerResponse } from 'node:http';

/**
 * Sends a JSON response with the specified status code and data.
 *
 * @param serverResponse - The HTTP server response object.
 * @param json - The JSON content to send in the response.
 */
export default function sendNotFoundJSONResponse(serverResponse: ServerResponse) {
  serverResponse.statusCode = 404;
  serverResponse.setHeader('Content-Type', 'application/json');
  serverResponse.end(JSON.stringify({
    error: 'not_found'
  }));
}
