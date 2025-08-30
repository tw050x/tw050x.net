import { ServiceContext } from '../../define-service';

/**
 * Sends an HTML response with the specified status code and html
 *
 * @param context - The service context object.
 * @param html - The HTML content to send in the response.
 */
export default function sendForbiddenHTMLResponse(context: ServiceContext, html: string) {
  context.serverResponse.statusCode = 403;
  context.serverResponse.setHeader('Content-Type', 'text/html');
  context.serverResponse.end(html);
}
