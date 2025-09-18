import { logger } from "@tw050x.net.library/logger";
import { ServiceContext } from "@tw050x.net.library/service";
import { isAllowedHeaders } from "@tw050x.net.library/utility/is-allowed-headers";
import { isAllowedMethod, AllowedHttpMethod } from "@tw050x.net.library/utility/is-allowed-method";
import { isAllowedOrigin } from "@tw050x.net.library/utility/is-allowed-origin";

type UseCorsFactoryOptions = {
  getConfiguration: (context: { configuration: ServiceContext['configuration'] }) => Promise<{
    allowedHeaders?: readonly string[] | '*';
    allowedMethods: readonly AllowedHttpMethod[] | '*';
    allowedOrigins?: string | '*';
  }>;
}

const defaultAllowedHeaders: readonly string[] = [
  'content-type',
  'authorization'
];

const defaultAllowedOrigins = '*';

/**
 * CORS headers middleware factory
 * Returns middleware that sets appropriate CORS headers based on request
 */
export const useCors = (options: UseCorsFactoryOptions) => async (context: ServiceContext) => {
  let configuration;
  try {
    configuration = await options.getConfiguration({ configuration: context.configuration });
  }
  catch (error) {
    logger.error('unable to read useCors() configuration', { error });
    context.serverResponse.statusCode = 500;
    return void context.serverResponse.end();
  }

  // Prepare headers to set on the response
  const headers = [];
  const allowedHeaders = configuration.allowedHeaders || defaultAllowedHeaders;
  const allowedMethods = configuration.allowedMethods;
  const allowedOrigins = configuration.allowedOrigins || defaultAllowedOrigins;

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
        allowedOrigins.split(',').map((origin) => origin.trim())
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
