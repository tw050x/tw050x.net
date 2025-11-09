import { UseAccessTokenCookieResultingContext } from "@tw050x.net.library/authentication/middleware/use-access-token-cookie";
import { UseLoginStateCookieResultingContext } from "@tw050x.net.library/authentication/middleware/use-login-state-cookie";
import { UseRefreshTokenCookieResultingContext } from "@tw050x.net.library/authentication/middleware/use-refresh-token-cookie";
import { logger } from "@tw050x.net.library/logger";
import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { default as Forbidden } from "@tw050x.net.library/uikit/document/Forbidden";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { default as jwt, SignOptions } from "jsonwebtoken";
import { serviceParameters } from "../parameters.js";
import { serviceSecrets } from "../secrets.js";

/**
 * Middleware factory for the login enabled gate.
 */
type Factory = () => Middleware<
  ServiceRequestContext & UseAccessTokenCookieResultingContext & UseLoginStateCookieResultingContext & UseRefreshTokenCookieResultingContext
>

/**
 * Middleware that refreshes authentication based on the refresh token cookie.
 */
export const useRefreshTokenGate: Factory = () => async (context) => {
  refreshAuthenticationGuard: {
    if (context.incomingMessage.refreshTokenCookie.refreshable !== true) {
      logger.debug('User is not authenticated');
      break refreshAuthenticationGuard;
    }
    logger.debug('User is already authenticated');

    // if refresh token cookie is not set
    // then clear the refreshable token cookie and break out of the guard
    const refreshTokenCookie = context.incomingMessage.refreshTokenCookie.raw;
    if (typeof refreshTokenCookie !== 'string') {
      logger.debug('Refresh token cookie is not set');
      context.serverResponse.refreshTokenCookie.clear();
      break refreshAuthenticationGuard;
    }

    // if JWT secret key is not set then return an internal server error
    const jwtSecretKey = serviceSecrets.getSecret('jwt.secret-key');
    if (jwtSecretKey === undefined) {
      logger.error('JWT secret key is not set');
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
    }

    // verify the refresh token
    // if it fails then clear the refreshable token cookie and return a forbidden error
    let refreshTokenPayload;
    try {
      refreshTokenPayload = jwt.verify(refreshTokenCookie, jwtSecretKey);
    }
    catch (error) {
      logger.error(error);
      context.serverResponse.refreshTokenCookie.clear();
      context.serverResponse.refreshTokenCookie.clear();
      return void context.serverResponse.sendForbiddenHTMLResponse(<Forbidden />);
    }

    // create the access token cookie
    const accessTokenOptions: SignOptions = {
      expiresIn: '1d',
    };
    const accessTokenPayload = {
      sub: refreshTokenPayload.sub
    };
    const accessToken = jwt.sign(accessTokenPayload, jwtSecretKey, accessTokenOptions);
    const returnUrl = context.incomingMessage.loginStateCookie.payload?.returnUrl || new URL('/', `https://${serviceParameters.getParameter('user.service.host')}`);
    context.serverResponse.accessTokenCookie.set(accessToken);
    context.serverResponse.loginStateCookie.clear();
    logger.debug('User authentication refreshed, redirecting to return URL');
    return void context.serverResponse.sendFoundRedirect(returnUrl);
  }
}
