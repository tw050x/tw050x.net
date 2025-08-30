import { ServiceContext } from '../../define-service';

/**
 * Sends a JSON response with the specified status code and data.
 *
 * @param context - The service context object.
 */
export default function sendNotImplementedTextResponse(context: ServiceContext) {
  context.serverResponse.statusCode = 501;
  context.serverResponse.setHeader('Content-Type', 'text/plain');
  context.serverResponse.end('Not Implemented');
}
