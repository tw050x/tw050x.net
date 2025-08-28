import { ServerResponse } from 'node:http';

/**
 * Sends a JSON response with the specified status code and data.
 *
 * @param serverResponse - The HTTP server response object.
 */
export default function sendUnauthorizedJSONResponse(serverResponse: ServerResponse) {
  serverResponse.statusCode = 401;
  serverResponse.setHeader('Content-Type', 'application/json');
  serverResponse.end(JSON.stringify({
    error: 'unauthorized'
  }));
}
