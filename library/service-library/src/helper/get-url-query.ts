import { ServiceContext } from "../define-service";

/**
 * Extracts the query parameters from the incoming HTTP request
 * Automatically decodes URL-encoded values using decodeURIComponent
 *
 * @param context - The service context object
 * @returns An object containing the query parameters as key-value pairs with decoded values
 * @throws Will throw an error if the URL is malformed or if query parameters cannot be parsed
 */
export const getUrlQuery = async (context: ServiceContext): Promise<Record<string, string>> => {
  const url = new URL(context.incomingMessage.url || '', `http://${context.incomingMessage.headers.host}`);
  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    try {
      query[key] = decodeURIComponent(value);
    } catch (error) {
      // If decoding fails, use the original value
      // Log error but continue processing other parameters
      query[key] = value;
    }
  });
  return query;
}
