import { ServiceContext } from '../../define-service';

/**
 * Sends an HTML response with the specified status code and html
 *
 * @param context - The service context object.
 * @param text - The text content to send in the response.
 */
export default function sendMovedTemporarilyTextResponse(context: ServiceContext, text: string) {
  context.serverResponse.statusCode = 302;
  context.serverResponse.setHeader('Content-Type', 'text/plain');
  context.serverResponse.end(text);
}
