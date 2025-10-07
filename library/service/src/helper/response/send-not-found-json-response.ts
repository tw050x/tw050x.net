import { ServiceRequestContext } from '../../types';

/**
 * Sends a JSON response with the specified status code and data.
 *
 * @param context - The service context object.
 * @param json - The JSON content to send in the response.
 */
export const sendNotFoundJSONResponse = (context: ServiceRequestContext) => {
  context.serverResponse.statusCode = 404;
  context.serverResponse.setHeader('Content-Type', 'application/json');
  context.serverResponse.end(JSON.stringify({
    error: 'not_found'
  }));
}
