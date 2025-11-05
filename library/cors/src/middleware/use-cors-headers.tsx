import { Parameter, isParameter, readParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { isAllowedHeaders } from "@tw050x.net.library/utility/is-allowed-headers";
import { isAllowedMethod } from "@tw050x.net.library/utility/is-allowed-method";
import { HttpMethod, isHttpMethod } from "@tw050x.net.library/utility/is-http-method";
import { isArrayOfHeaders } from "@tw050x.net.library/utility/is-array-of-headers";
import { isArrayOfHttpMethods } from "@tw050x.net.library/utility/is-array-of-http-methods";
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

  // Determine the allowed headers
  // return an error in the following cases:
  // 1. allowedHeaders is a Parameter but fails to read
  // 2. allowedHeaders is a Parameter but results in empty string
  // 3. allowedHeaders is neither Parameter, array of string, nor wildcard '*'
  allowedHeadersParameterGuard: {
    if (isParameter(options.allowedHeaders) === false) {
      break allowedHeadersParameterGuard;
    }
    try {
      allowedHeaders = await readParameter(options.allowedHeaders.key)
    }
    catch (error) {
      logger.error(error);
      context.serverResponse.statusCode = 500;
      return void context.serverResponse.end();
    }
    if (allowedHeaders === '') {
      logger.error(new Error('CORS allowed headers parameter is empty string'));
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
    }
    allowedHeaders = allowedHeaders.split(',').map((header) => header.trim().toLowerCase());
  }
  allowedHeadersOptionsArrayGuard: {
    if (allowedHeaders !== undefined) {
      break allowedHeadersOptionsArrayGuard;
    }
    if (isArrayOfHeaders(options.allowedHeaders) === false) {
      // An error will be thrown later if allowedHeaders is neither an array nor wildcard
      // For now we do not know if we should return an error so we break and delegate the
      // error handling to a subsequent guard
      break allowedHeadersOptionsArrayGuard;
    }
    allowedHeaders = options.allowedHeaders
  }
  allowedHeadersOptionsWildcardGuard: {
    if (allowedHeaders !== undefined) {
      break allowedHeadersOptionsWildcardGuard;
    }
    allowedHeaders = '*' as const; // Requires "as const" to ensure type is literal '*' not a generalised 'string'.
  }

  // Determine the allowed methods
  // return an error in the following cases:
  // 1. allowedMethods is a Parameter but fails to read
  // 2. allowedMethods is a Parameter but results in empty string
  // 3. allowedMethods is neither Parameter, array of HttpMethod, nor wildcard '*'
  allowedMethodsParameterGuard: {
    if (isParameter(options.allowedMethods) === false) {
      break allowedMethodsParameterGuard;
    }
    try {
      allowedMethods = await readParameter(options.allowedMethods.key)
    }
    catch (error) {
      logger.error(error);
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
    }
    if (allowedMethods === '') {
      logger.error(new Error('CORS allowed methods parameter is empty string'));
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
    }
    allowedMethods = allowedMethods.
      split(',').
      map((method) => method.trim().toUpperCase()).
      filter((method): method is HttpMethod => method !== undefined && isHttpMethod(method));
  }
  allowedMethodsOptionsArrayGuard: {
    if (allowedMethods !== undefined) {
      break allowedMethodsOptionsArrayGuard;
    }
    if (isArrayOfHttpMethods(options.allowedMethods) === false) {
      // An error will be thrown later if allowedMethods is neither an array nor wildcard
      // For now we do not know if we should return an error so we break and delegate the
      // error handling to a subsequent guard
      break allowedMethodsOptionsArrayGuard;
    }
    allowedMethods = options.allowedMethods
  }
  allowedMethodsOptionsWildcardGuard: {
    if (allowedMethods !== undefined) {
      break allowedMethodsOptionsWildcardGuard;
    }
    if (options.allowedMethods !== '*') {
      logger.error(new Error('CORS allowed methods is neither array of HttpMethod nor wildcard'));
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
    }
    allowedMethods = '*' as const; // Requires "as const" to ensure type is literal '*' not a generalised 'string'.
  }

  allowedOriginsParameterGuard: {
    if (isParameter(options.allowedOrigins) === false) {
      break allowedOriginsParameterGuard;
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
