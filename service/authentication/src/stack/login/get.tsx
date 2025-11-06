import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/authentication/use-access-token-cookie";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/authentication/use-login-state-cookie";
import { UseRefreshTokenCookieOptions, useRefreshTokenCookie } from "@tw050x.net.library/authentication/use-refresh-token-cookie";
import { useParameter, readParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { useSecret } from "@tw050x.net.library/secret";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as ForbiddenDocument } from "@tw050x.net.library/uikit/document/Forbidden";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { default as jwt, SignOptions } from "jsonwebtoken";
import { generateLoginFormNonce } from '../../helper/generate-login-form-nonce.js';
import { useLoginEnabledGate } from "../../middleware/use-login-enabled-gate.js";
import { default as LoginDocument } from "../../template/document/LoginDocument.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'POST', 'OPTIONS'],
  allowedOrigins: useParameter('authentication.service.allowed-origins'),
}

const useAccessTokenCookieOptions: UseAccessTokenCookieOptions = {
  cookieName: useParameter('cookie.access-token.name'),
  cookieDomain: useParameter('cookie.access-token.domain'),
  jwtSecretKey: useSecret('jwt.secret-key'),
}

const useLoginStateCookieOptions: UseLoginStateCookieOptions = {
  cookieName: useParameter('cookie.login-state.name'),
  cookieDomain: useParameter('cookie.login-state.domain'),
  encrypterSecretKey: useSecret('encrypter.secret-key'),
}

const useRefreshTokenCookieOptions: UseRefreshTokenCookieOptions = {
  cookieName: useParameter('cookie.refresh-token.name'),
  cookieDomain: useParameter('cookie.refresh-token.domain'),
  jwtSecretKey: useSecret('jwt.secret-key'),
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useLoginEnabledGate(),
  useAccessTokenCookie(useAccessTokenCookieOptions),
  useLoginStateCookie(useLoginStateCookieOptions),
  useRefreshTokenCookie(useRefreshTokenCookieOptions),

  // check if the user has a valid access token
  // async (context) => {
  // TODO: implement access token check
  // },

  // check if the user has a valid refresh token
  async (context) => {
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
      const jwtSecretKey = await readParameter('jwt.secret-key')
      if (jwtSecretKey === undefined) {
        logger.error('JWT secret key is not set');
        return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
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
        return void context.serverResponse.sendForbiddenHTMLResponse(<ForbiddenDocument />);
      }

      // create the access token cookie
      const accessTokenOptions: SignOptions = {
        expiresIn: '1d',
      };
      const accessTokenPayload = {
        sub: refreshTokenPayload.sub
      };
      const accessToken = jwt.sign(accessTokenPayload, jwtSecretKey, accessTokenOptions);
      const returnUrl = context.incomingMessage.loginStateCookie.payload?.returnUrl || new URL('/', `https://${await readParameter('authentication.service.host')}`);
      context.serverResponse.accessTokenCookie.set(accessToken);
      context.serverResponse.loginStateCookie.clear();
      logger.debug('User authentication refreshed, redirecting to return URL');
      return void context.serverResponse.sendFoundRedirect(returnUrl);
    }
  },

  // user is not authenticated and does not have a valid refresh token
  async (context) => {
    logger.debug('Creating nonce for login form');
    let nonce;
    try {
      nonce = await generateLoginFormNonce();
    }
    catch (error) {
      logger.error(error);
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
    }
    const loginAsideProps = {
      loginFormProps: {
        email: '',
        nonce,
        validationErrors: []
      }
    }

    // return the login page
    logger.debug('Rendering login page');
    const returnUrl = context.incomingMessage.loginStateCookie.payload?.returnUrl || new URL('/', `https://${await readParameter('authentication.service.host')}`);
    context.serverResponse.loginStateCookie.set(JSON.stringify({
      returnUrl: returnUrl.toString()
    }));
    return void context.serverResponse.sendOKHTMLResponse(<LoginDocument loginAsideProps={loginAsideProps} />);
  }
])
