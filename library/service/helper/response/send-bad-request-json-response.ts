import { ServerResponse } from 'node:http';

/**
 * Sends a JSON response with the specified status code and data.
 *
 * @param serverResponse - The HTTP server response object.
 */
export default function sendBadRequestJSONResponse(serverResponse: ServerResponse) {
  serverResponse.statusCode = 400;
  serverResponse.setHeader('Content-Type', 'application/json');
  serverResponse.end(JSON.stringify({
    error: 'bad request'
  }));
}
