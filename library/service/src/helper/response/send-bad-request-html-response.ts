import { ServiceContext } from '../../define-service';

/**
 * Sends a JSON response with the specified status code and data.
 *
 * @param context - The service context object.
 */
export default function sendBadRequestHTMLResponse(context: ServiceContext, html: string) {
  context.serverResponse.statusCode = 400;
  context.serverResponse.setHeader('Content-Type', 'text/html');
  context.serverResponse.end(html);
}
