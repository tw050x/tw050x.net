import { ServiceContext } from "../../define-service";

/**
 * Sends an HTML response with the specified status code and data.
 *
 * @param context - The service context object.
 * @param text - The plain text content to send in the response.
 */
export default function sendOKTextResponse(context: ServiceContext, text: string) {
  context.serverResponse.statusCode = 200;
  context.serverResponse.setHeader('Content-Type', 'text/plain');
  context.serverResponse.end(text);
}
