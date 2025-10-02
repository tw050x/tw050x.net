import { ServiceContext } from "../define-service";

/**
 * Extracts URL path parameters from an HTTP request URL by matching against a route pattern
 *
 * @param context - The service context object
 * @param pattern - The route pattern with parameter placeholders (e.g., "/portal/agent/:uuid")
 * @returns A record containing all matched path parameters as key-value pairs
 *
 * @example
 * const params = useUrlParams(req, "/portal/agent/:uuid");
 *
 * @example
 * const params = useUrlParams(req, "/users/:userId/posts/:postId");
 */
export const useUrlParams = async (context: ServiceContext, pattern: string): Promise<Record<string, string>> => {
  // Extract the URL path from the incoming message
  // Handle case where url might be undefined
  if (!context.incomingMessage.url) {
    return {};
  }

  // Parse the URL to get just the pathname
  const url = new URL(context.incomingMessage.url, `http://${context.incomingMessage.headers.host}`);
  const pathname = url.pathname;

  // Split both the pattern and actual path into segments
  const patternSegments = pattern.split('/').filter(segment => segment !== '');
  const pathSegments = pathname.split('/').filter(segment => segment !== '');

  // Return empty object if segment counts don't match
  if (patternSegments.length !== pathSegments.length) {
    return {};
  }

  // Extract parameters by matching pattern segments with path segments
  const params: Record<string, string> = {};
  for (let i = 0; i < patternSegments.length; i++) {
    const patternSegment = patternSegments[i];
    const pathSegment = pathSegments[i];

    // Check if this is a parameter segment (starts with :)
    if (patternSegment.startsWith(':')) {
      const paramName = patternSegment.slice(1);
      params[paramName] = decodeURIComponent(pathSegment);
    } else if (patternSegment !== pathSegment) {
      // Static segments must match exactly
      return {};
    }
  }

  return params;
}
