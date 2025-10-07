import { ServiceRequestContext } from '../../types';

/**
 * Sends a JSON response with the specified status code and data.
 *
 * @param context - The service context object.
 */
export const sendUnauthorizedJSONResponse = (context: ServiceRequestContext) => {
  context.serverResponse.statusCode = 401;
  context.serverResponse.setHeader('Content-Type', 'application/json');
  context.serverResponse.end(JSON.stringify({
    error: 'unauthorized'
  }));
}
