import { ServiceContext } from "../../define-service";

/**
 * Sends a JSON response with the specified status code and data.
 *
 * @param context - The service context object.
 * @param html - The HTML content to send in the response.
 */
export const sendUnauthorizedHTMLResponse = (context: ServiceContext, html: string) => {
  context.serverResponse.statusCode = 401;
  context.serverResponse.setHeader('Content-Type', 'text/html');
  context.serverResponse.end(html);
}
