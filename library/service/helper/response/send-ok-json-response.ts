import { ServerResponse } from 'node:http';


/**
 * Sends a JSON response with the specified status code and data.
 *
 * @param serverResponse - The HTTP server response object.
 * @param data - The JSON data to send in the response.
 */
export default function sendOKJSONResponse(serverResponse: ServerResponse, data: Record<string, unknown>) {
  serverResponse.statusCode = 200;
  serverResponse.setHeader('Content-Type', 'application/json');
  serverResponse.end(JSON.stringify(data));
}
