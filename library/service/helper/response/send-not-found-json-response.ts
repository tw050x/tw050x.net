import { ServiceContext } from '../../define-service';

/**
 * Sends a JSON response with the specified status code and data.
 *
 * @param context - The service context object.
 * @param json - The JSON content to send in the response.
 */
export default function sendNotFoundJSONResponse(context: ServiceContext) {
  context.serverResponse.statusCode = 404;
  context.serverResponse.setHeader('Content-Type', 'application/json');
  context.serverResponse.end(JSON.stringify({
    error: 'not_found'
  }));
}
