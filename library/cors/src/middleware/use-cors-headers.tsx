import { read as readConfig } from "@tw050x.net.library/configs";
import { logger } from "@tw050x.net.library/logger";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { isAllowedHeaders } from "@tw050x.net.library/utility/is-allowed-headers";
import { isAllowedMethod } from "@tw050x.net.library/utility/is-allowed-method";
import { HttpMethod, isHttpMethod } from "@tw050x.net.library/utility/is-http-method";
import { isArrayOfHeaders } from "@tw050x.net.library/utility/is-array-of-headers";
import { isArrayOfHttpMethods } from "@tw050x.net.library/utility/is-array-of-http-methods";
import { isAllowedOrigin } from "@tw050x.net.library/utility/is-allowed-origin";

/**
 * Options for CORS headers middleware factory
 */
export type UseCorsHeadersFactoryOptions = {
  allowedHeaders?: readonly string[] | string | '*';
  allowedMethods: readonly HttpMethod[] | '*';
}

/**
 * CORS headers middleware factory type
 */
type Factory = (options: UseCorsHeadersFactoryOptions) => Middleware<ServiceRequestContext>;

/**
 * CORS headers middleware factory
 * Returns middleware that sets appropriate CORS headers based on request
 */
export const useCorsHeaders: Factory = (options) => async (context) => {
  const allowedOriginsConfig = readConfig('cors.*.allowed-origins');

  // Define variables to hold processed options
  let allowedHeaders;
  let allowedMethods;
  let allowedOrigins;

  // Determine the allowed headers
  allowedHeadersParameterGuard: {
    if (options.allowedHeaders === undefined) {
      allowedHeaders = '*' as const;
      break allowedHeadersParameterGuard;
    }
    if (options.allowedHeaders === '') {
      allowedHeaders = [] as Array<string>;
      break allowedHeadersParameterGuard;
    }
    if (options.allowedHeaders === '*') {
      allowedHeaders = '*' as const;
      break allowedHeadersParameterGuard;
    }
    if (typeof options.allowedHeaders === 'string') {
      allowedHeaders = options.allowedHeaders.
        split(',').
        map((header) => header.trim().toLowerCase());
      break allowedHeadersParameterGuard;
    }
    allowedHeaders = options.allowedHeaders.
      map((header) => header.trim().toLowerCase());
  }
  logger.debug(`Allowed Headers: ${allowedHeaders === '*' ? '*' : allowedHeaders.join(', ')}`);
  if (Array.isArray(allowedHeaders) && isArrayOfHeaders(allowedHeaders) === false) {
    throw new TypeError('Invalid allowedHeaders parameter');
  }

  // Determine the allowed methods
  allowedMethodsParameterGuard: {
    if (options.allowedMethods === '*') {
      allowedMethods = '*' as const;
      break allowedMethodsParameterGuard;
    }
    allowedMethods = options.allowedMethods.
      map((method) => method.trim().toUpperCase()).
      filter((method): method is HttpMethod => method !== undefined && isHttpMethod(method));
  }
  logger.debug(`Allowed Methods: ${allowedMethods === '*' ? '*' : allowedMethods.join(', ')}`);
  if (Array.isArray(allowedMethods) && isArrayOfHttpMethods(allowedMethods) === false) {
    throw new TypeError('Invalid allowedMethods parameter');
  }

  // Determine the allowed origins
  allowedOriginsParameterGuard: {
    if (allowedOriginsConfig === '*') {
      allowedOrigins = '*' as const;
      break allowedOriginsParameterGuard;
    }
    allowedOrigins = allowedOriginsConfig.split(',').map((origin) => origin.trim())
  }
  logger.debug(`Allowed Origins: ${allowedOrigins === '*' ? '*' : allowedOrigins.join(', ')}`);

  // Prepare headers to set on the response
  const headers = [];

  // Set the allowed origins header
  // 1. If wildcard is allowed, set the header to '*'
  // 2. If a specific origin is allowed, set the header to that origin
  allowedOriginsGuard: {
    if (allowedOrigins === '*') {
      headers.push({
        key: 'Access-Control-Allow-Origin',
        value: '*'
      });
      break allowedOriginsGuard;
    }
    if (
      isAllowedOrigin(
        context.incomingMessage.headers.origin,
        allowedOrigins
      )
    ) {
      headers.push({
        key: 'Access-Control-Allow-Origin',
        value: context.incomingMessage.headers.origin
      });
      break allowedOriginsGuard;
    }
  }

  // Set the allowed methods header
  // 1. If wildcard is allowed, set the header to '*'
  // 2. If specific methods are allowed, set the header to those methods
  // TODO: review implementation. do we need to check allowed methods to set the header?
  allowedMethodsGuard: {
    if (allowedMethods === '*') {
      headers.push({
        key: 'Access-Control-Allow-Methods',
        value: '*'
      });
      break allowedMethodsGuard;
    }
    if (
      isAllowedMethod(
        context.incomingMessage.method,
        allowedMethods
      )
    ) {
      headers.push({
        key: 'Access-Control-Allow-Methods',
        value: allowedMethods.join(', ')
      });
      break allowedMethodsGuard;
    }
  }

  // Set allowed headers header
  // 1. If this is not a pre flight request, we can skip this header
  // 2. If a wildcard is allowed, we can set the header to '*'
  // 3. If specific headers are allowed, we can set the header to those headers
  // TODO: review implementation. do we need to check allowed headers to set the header?
  const isPreflight = context.incomingMessage.method === 'OPTIONS' && context.incomingMessage.headers['access-control-request-method'] !== undefined;
  allowedHeadersGuard: {
    if (isPreflight === false) {
      break allowedHeadersGuard;
    }
    if (allowedHeaders === '*') {
      headers.push({
        key: 'Access-Control-Allow-Headers',
        value: '*'
      });
      break allowedHeadersGuard;
    }
    if (
      isAllowedHeaders(
        context.incomingMessage.headers['access-control-request-headers'],
        allowedHeaders
      )
    ) {
      headers.push({
        key: 'Access-Control-Allow-Headers',
        value: allowedHeaders.join(', ')
      });
    }
  }

  // Set the CORS headers on the response
  headers.forEach(
    ({ key, value }) => {
      context.serverResponse.setHeader(key, value);
    }
  );
}
