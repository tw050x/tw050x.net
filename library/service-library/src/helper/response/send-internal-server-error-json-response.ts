import { ServiceContext } from '../../define-service';

/**
 * Sends a JSON response with the specified status code and data.
 *
 * @param context - The service context object.
 */
export const sendInternalServerErrorJSONResponse = (context: ServiceContext) => {
  context.serverResponse.statusCode = 500;
  context.serverResponse.setHeader('Content-Type', 'application/json');
  context.serverResponse.end(JSON.stringify({
    error: 'internal server error'
  }));
}
