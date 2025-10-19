import { IncomingMessage } from "node:http";
import { Socket } from "node:net";

/**
 *
 */
export default class ContextualIncomingMessage extends IncomingMessage {

  /**
   *
   */
  constructor(socket: Socket) {
    super(socket);
  }

  /**
   * Extracts and parses the form data body from the incoming message.
   *
   * @returns A promise that resolves to an object containing key-value pairs from the form data, or null if parsing fails.
   *
   * @example
   *
   * // Given an incoming message with body 'name=John&age=30'
   * const formData = await incomingMessage.useFormDataBody();
   * console.log(formData); // { name: 'John', age: '30' }
   *
   * // Given an incoming message with body 'city=New+York&country=USA'
   * const formData = await incomingMessage.useFormDataBody();
   * console.log(formData); // { city: 'New York', country: 'USA' }
   *
   * // Given an incoming message with invalid form data body
   * const formData = await incomingMessage.useFormDataBody();
   * console.log(formData); // null
   *
   * // Given an incoming message with empty body
   * const formData = await incomingMessage.useFormDataBody();
   * console.log(formData); // {}
   *
   * // Given an incoming message with body 'keyOnly='
   * const formData = await incomingMessage.useFormDataBody();
   * console.log(formData); // { keyOnly: '' }
   */
  async useFormDataBody(): Promise<Record<string, string> | null> {
    let body = '';

    // Handle errors during data collection
    this.on('error', (error) => {
      throw new Error(`Error collecting request body: ${error.message}`);
    });

    // collect chunks of data from the incoming message
    this.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });

    // wait for the end of the incoming message
    await new Promise<void>((resolve) => {
      this.on('end', () => {
        resolve();
      });
    });

    let result: Record<string, string> | null;

    try {
      result = Object.fromEntries(new URLSearchParams(body));
    }
    catch (error) {
      result = null;
    }

    return result;
  }

  /**
   * Extracts and parses the JSON body from the incoming message.
   *
   * @returns A promise that resolves to the parsed JSON object, or null if parsing fails.
   *
   * @example
   * // Given an incoming message with body '{"name":"John","age":30}'
   * const jsonBody = await incomingMessage.useJSONBody();
   * console.log(jsonBody); // { name: 'John', age: 30 }
   *
   * // Given an incoming message with invalid JSON body
   * const jsonBody = await incomingMessage.useJSONBody();
   * console.log(jsonBody); // null
   *
   * // Given an incoming message with empty body
   * const jsonBody = await incomingMessage.useJSONBody();
   * console.log(jsonBody); // null
   *
   * // Given an incoming message with body 'null'
   * const jsonBody = await incomingMessage.useJSONBody();
   * console.log(jsonBody); // null
   *
   * // Given an incoming message with body '42'
   * const jsonBody = await incomingMessage.useJSONBody();
   * console.log(jsonBody); // 42
   *
   * // Given an incoming message with body '"Hello, World!"'
   * const jsonBody = await incomingMessage.useJSONBody();
   * console.log(jsonBody); // 'Hello, World!'
   *
   * // Given an incoming message with body '{"isAdmin":false,"roles":["user","editor"]}'
   * const jsonBody = await incomingMessage.useJSONBody();
   * console.log(jsonBody); // { isAdmin: false, roles: [ 'user', 'editor' ] }
   *
   * // Given an incoming message with body '[1,2,3,4,5]'
   * const jsonBody = await incomingMessage.useJSONBody();
   * console.log(jsonBody); // [1, 2, 3, 4, 5]
   *
   * // Given an incoming message with body '{"nested":{"a":1,"b":2}}'
   * const jsonBody = await incomingMessage.useJSONBody();
   * console.log(jsonBody); // { nested: { a: 1, b: 2 } }
   */
  async useJSONBody(): Promise<unknown> {
    let body = '';

    // Handle errors during data collection
    this.on('error', (error) => {
      throw new Error(`Error collecting request body: ${error.message}`);
    });

    // collect chunks of data from the incoming message
    this.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });

    // wait for the end of the incoming message
    await new Promise<void>((resolve) => {
      this.on('end', () => {
        resolve();
      });
    });

    let result: unknown | null;

    try {
      result = JSON.parse(body);
    }
    catch (error) {
      result = null;
    }

    return result;
  }

  /**
   * Extracts URL parameters from the incoming message based on the provided pattern.
   *
   * @param pattern The URL pattern containing parameter placeholders (e.g., /users/:id/profile).
   * @returns A promise that resolves to an object mapping parameter names to their values.
   *
   * @example
   * // Given an incoming message with URL '/users/123/profile'
   * const params = await incomingMessage.useUrlParams('/users/:id/profile');
   * console.log(params); // { id: '123' }
   *
   * // If the URL does not match the pattern
   * const params = await incomingMessage.useUrlParams('/users/:id/settings');
   * console.log(params); // {}
   *
   * // If there are no parameters in the pattern
   * const params = await incomingMessage.useUrlParams('/about');
   * console.log(params); // {}
   *
   * // If the URL is undefined or empty
   * const params = await incomingMessage.useUrlParams('/users/:id/profile');
   * console.log(params); // {}
   *
   * // If the URL contains encoded characters
   * // Given an incoming message with URL '/search/%E2%9C%94'
   * const params = await incomingMessage.useUrlParams('/search/:query');
   * console.log(params); // { query: '✓' }
   *
   * // If the URL has extra segments not in the pattern
   * // Given an incoming message with URL '/users/123/profile'
   * const params = await incomingMessage.useUrlParams('/users/:id');
   * console.log(params); // {}
   *
   * // If the pattern has extra segments not in the URL
   * // Given an incoming message with URL '/users/123'
   * const params = await incomingMessage.useUrlParams('/users/:id/profile');
   * console.log(params); // {}
   *
   * // If multiple parameters are present
   * // Given an incoming message with URL '/orders/456/items/789'
   * const params = await incomingMessage.useUrlParams('/orders/:orderId/items/:itemId');
   * console.log(params); // { orderId: '456', itemId: '789' }
   *
   * // If no parameters are present in the URL or pattern
   * // Given an incoming message with URL '/home'
   * const params = await incomingMessage.useUrlParams('/home');
   * console.log(params); // {}
   *
   * // If the URL contains query parameters
   * // Given an incoming message with URL '/products/123?ref=abc'
   * const params = await incomingMessage.useUrlParams('/products/:productId');
   * console.log(params); // { productId: '123' }
   *
   * // If the URL contains a trailing slash
   * // Given an incoming message with URL '/users/123/profile/'
   * const params = await incomingMessage.useUrlParams('/users/:id/profile');
   * console.log(params); // { id: '123' }
   *
   * // If the pattern contains a trailing slash
   * // Given an incoming message with URL '/users/123/profile'
   * const params = await incomingMessage.useUrlParams('/users/:id/profile/');
   * console.log(params); // { id: '123' }
   *
   * // If both URL and pattern contain trailing slashes
   * // Given an incoming message with URL '/users/123/profile/'
   * const params = await incomingMessage.useUrlParams('/users/:id/profile/');
   * console.log(params); // { id: '123' }
   *
   * // If the URL is just the root '/'
   * // Given an incoming message with URL '/'
   * const params = await incomingMessage.useUrlParams('/');
   * console.log(params); // {}
   *
   * // If the pattern is just the root '/'
   * // Given an incoming message with URL '/users/123'
   * const params = await incomingMessage.useUrlParams('/');
   * console.log(params); // {}
   *
   * // If both URL and pattern are just the root '/'
   * // Given an incoming message with URL '/'
   * const params = await incomingMessage.useUrlParams('/');
   * console.log(params); // {}
   *
   * // If the URL contains special characters
   * // Given an incoming message with URL '/files/%40special%21chars'
   * const params = await incomingMessage.useUrlParams('/files/:filename');
   * console.log(params); // { filename: '@special!chars' }
   */
  async useUrlParams(pattern: string): Promise<Record<string, string>> {
    // Extract the URL path from the incoming message
    // Handle case where url might be undefined
    if (this.url === undefined || this.url === '') {
      return {};
    }

    // Parse the URL to get just the pathname
    const url = new URL(this.url, `http://${this.headers.host}`);
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
      }
      else if (patternSegment !== pathSegment) {
        // Static segments must match exactly
        return {};
      }
    }

    return params;
  }

  /**
   * Extracts URL query parameters from the incoming message.
   *
   * @returns A promise that resolves to an object containing key-value pairs from the URL query parameters.
   *
   * @example
   * // Given an incoming message with URL '/search?query=hello&page=2'
   * const query = await incomingMessage.useUrlQuery();
   * console.log(query); // { query: 'hello', page: '2' }
   *
   * // Given an incoming message with URL '/products?category=books&sort=asc'
   * const query = await incomingMessage.useUrlQuery();
   * console.log(query); // { category: 'books', sort: 'asc' }
   *
   * // Given an incoming message with URL '/items'
   * const query = await incomingMessage.useUrlQuery();
   * console.log(query); // {}
   */
  async useUrlQuery(): Promise<Record<string, string>> {
    const url = new URL(this.url || '', `http://${this.headers.host}`);
    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      try {
        query[key] = decodeURIComponent(value);
      }
      catch (error) {
        // If decoding fails, use the original value
        // Log error but continue processing other parameters
        query[key] = value;
      }
    });
    return query;
  }
}
