import { ServerResponse } from 'node:http';

/**
 * Sends a JSON response with the specified status code and data.
 *
 * @param serverResponse - The HTTP server response object.
 */
export default function sendInternalServerErrorJSONResponse(serverResponse: ServerResponse) {
  serverResponse.statusCode = 500;
  serverResponse.setHeader('Content-Type', 'application/json');
  serverResponse.end(JSON.stringify({
    error: 'internal server error'
  }));
}
