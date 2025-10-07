import { ServiceRequestContext } from '../../types';

/**
 * Sends a JSON response with the specified status code and data.
 *
 * @param context - The service context object.
 */
export const sendNotImplementedTextResponse = (context: ServiceRequestContext) => {
  context.serverResponse.statusCode = 501;
  context.serverResponse.setHeader('Content-Type', 'text/plain');
  context.serverResponse.end('Not Implemented');
}
