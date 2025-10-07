import { Parameter, isParameter, readParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { isAllowedHeaders } from "@tw050x.net.library/utility/is-allowed-headers";
import { HttpMethod, isAllowedMethod, isHttpMethod } from "@tw050x.net.library/utility/is-allowed-method";
import { isAllowedOrigin } from "@tw050x.net.library/utility/is-allowed-origin";

/**
 *
 */
export type UseCorsHeadersFactoryOptions = {
  allowedHeaders?: readonly string[] | '*' | Parameter;
  allowedMethods: readonly HttpMethod[] | '*' | Parameter;
  allowedOrigins?: string | '*' | Parameter;
}

/**
 *
 */
type Factory = (options: UseCorsHeadersFactoryOptions) => Middleware<ServiceRequestContext>;

/**
 * CORS headers middleware factory
 * Returns middleware that sets appropriate CORS headers based on request
 */
export const useCorsHeaders: Factory = (options) => async (context) => {

  let allowedHeaders;
  let allowedMethods;
  let allowedOrigins;

  allowedHeadersGuard: {
    if (isParameter(options.allowedHeaders) === false) {
      break allowedHeadersGuard;
    }
    try {
      allowedHeaders = await readParameter(options.allowedHeaders.key)
    }
    catch (error) {
      logger.error(error);
      context.serverResponse.statusCode = 500;
      return void context.serverResponse.end();
    }
  }
  if (allowedHeaders === undefined || allowedHeaders === '') {
    allowedHeaders = '*';
  }
  if (allowedHeaders !== '*') {
    allowedHeaders = allowedHeaders.split(',').map((header) => header.trim().toLowerCase());
  }

  allowedMethodsGuard: {
    if (isParameter(options.allowedMethods) === false) {
      break allowedMethodsGuard;
    }
    try {
      allowedMethods = await readParameter(options.allowedMethods.key)
    }
    catch (error) {
      logger.error(error);
      context.serverResponse.statusCode = 500;
      return void context.serverResponse.end();
    }
  }
  if (allowedMethods === undefined || allowedMethods === '') {
    allowedMethods = '*';
  }
  if (allowedMethods !== '*') {
    allowedMethods = allowedMethods.
      split(',').
      map((method) => method.trim().toUpperCase()).
      filter((method): method is HttpMethod => method !== undefined && isHttpMethod(method));
  }

  allowedOriginsGuard: {
    if (isParameter(options.allowedOrigins) === false) {
      break allowedOriginsGuard;
    }
    try {
      allowedOrigins = await readParameter(options.allowedOrigins.key)
    }
    catch (error) {
      logger.error(error);
      context.serverResponse.statusCode = 500;
      return void context.serverResponse.end();
    }
  }
  if (allowedOrigins === undefined || allowedOrigins === '') {
    allowedOrigins = '*';
  }
  if (allowedOrigins !== '*') {
    allowedOrigins = allowedOrigins.trim();
    allowedOrigins = allowedOrigins.split(',').map((origin) => origin.trim())
  }

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
