import { ServiceContext } from '../../define-service';


/**
 * Sends a JSON response with the specified status code and data.
 *
 * @param context - The service context object.
 * @param data - The JSON data to send in the response.
 */
export default function sendAcceptedJSONResponse(context: ServiceContext, data: Record<string, unknown>) {
  context.serverResponse.statusCode = 202;
  context.serverResponse.setHeader('Content-Type', 'application/json');
  context.serverResponse.end(JSON.stringify(data));
}
