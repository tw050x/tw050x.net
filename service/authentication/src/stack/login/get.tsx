import { useParameter, readParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/middleware/use-access-token-cookie";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/middleware/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/middleware/use-login-state-cookie";
import { UseRefreshTokenCookieOptions, useRefreshTokenCookie } from "@tw050x.net.library/middleware/use-refresh-token-cookie";
import { UseRefreshableTokenCookieOptions, useRefreshableTokenCookie } from "@tw050x.net.library/middleware/use-refreshable-token-cookie";
import { useSecret } from "@tw050x.net.library/secret";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { sendFoundRedirect } from "@tw050x.net.library/service/helper/redirect/send-found-redirect";
import { sendForbiddenHTMLResponse } from "@tw050x.net.library/service/helper/response/send-forbidden-html-response";
import { sendInternalServerErrorHTMLResponse } from "@tw050x.net.library/service/helper/response/send-internal-server-error-html-response";
import { sendOKHTMLResponse } from "@tw050x.net.library/service/helper/response/send-ok-html-response";
import { default as ForbiddenDocument } from "@tw050x.net.library/uikit/document/Forbidden";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { SignOptions, sign, verify } from "jsonwebtoken";
import { generateLoginFormNonce } from '../../helper/generate-login-form-nonce';
import { default as LoginDocument } from "../../template/document/LoginDocument";

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
  allowedReturnUrlDomains: useParameter('authentication.service.allowed-return-url-domains'),
  cookieName: useParameter('cookie.login-state.name'),
  cookieDomain: useParameter('cookie.login-state.domain'),
  encrypterSecretKey: useSecret('encrypter.secret-key'),
}

const useRefreshTokenCookieOptions: UseRefreshTokenCookieOptions = {
  cookieName: useParameter('cookie.refresh-token.name'),
  cookieDomain: useParameter('cookie.refresh-token.domain'),
  jwtSecretKey: useSecret('jwt.secret-key'),
}

const useRefreshableTokenCookieOptions: UseRefreshableTokenCookieOptions = {
  cookieName: useParameter('cookie.refreshable-token.name'),
  cookieDomain: useParameter('cookie.refreshable-token.domain'),
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),

  // Render the login page in a disabled state if it is not enabled
  async (context) => {
    const loginEnabled = await readParameter('authentication.service.login-enabled');
    if (loginEnabled === 'false') {
      const loginAsideProps = {
        disabled: true,
        message: 'Login is currently disabled.',
      } as const;
      return void sendOKHTMLResponse(context, await <LoginDocument loginAsideProps={loginAsideProps} />);
    }
  },

  useAccessTokenCookie(useAccessTokenCookieOptions),
  useLoginStateCookie(useLoginStateCookieOptions),
  useRefreshTokenCookie(useRefreshTokenCookieOptions),
  useRefreshableTokenCookie(useRefreshableTokenCookieOptions),


  // check if the user has a valid access token
  // async (context) => {

  // },

  // check if the user has a valid refresh token
  async (context) => {
    const refreshableTokenCookie = context.incomingMessage.refreshableTokenCookie.raw;
    refreshAuthenticationGuard: {
      if (typeof refreshableTokenCookie !== 'string' || refreshableTokenCookie !== 'true') {
        logger.debug('user is not authenticated');
        break refreshAuthenticationGuard;
      }
      logger.debug('user is already authenticated');

      // if refresh token cookie is not set
      // then clear the refreshable token cookie and break out of the guard
      const refreshTokenCookie = context.incomingMessage.refreshTokenCookie.raw;
      if (typeof refreshTokenCookie !== 'string') {
        logger.debug('refresh token cookie is not set');
        context.serverResponse.refreshableTokenCookie.clear();
        break refreshAuthenticationGuard;
      }

      // if JWT secret key is not set then return an internal server error
      const jwtSecretKey = await readParameter('jwt.secret-key')
      if (jwtSecretKey === undefined) {
        logger.error('JWT secret key is not set');
        return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
      }

      // verify the refresh token
      // if it fails then clear the refreshable token cookie and return a forbidden error
      let refreshTokenPayload;
      try {
        refreshTokenPayload = verify(refreshTokenCookie, jwtSecretKey);
      }
      catch (error) {
        logger.error(error);
        context.serverResponse.refreshableTokenCookie.clear();
        context.serverResponse.refreshTokenCookie.clear();
        return void sendForbiddenHTMLResponse(context, await <ForbiddenDocument />);
      }

      // create the access token cookie
      const accessTokenOptions: SignOptions = {
        expiresIn: '1d',
      };
      const accessTokenPayload = {
        sub: refreshTokenPayload.sub
      };
      const accessToken = sign(accessTokenPayload, jwtSecretKey, accessTokenOptions);
      const returnUrl = context.incomingMessage.loginStateCookie.payload?.returnUrl || new URL('/', `https://${await readParameter('authentication.service.host')}`);
      context.serverResponse.accessTokenCookie.set(accessToken);
      context.serverResponse.loginStateCookie.clear();
      return void sendFoundRedirect(context, returnUrl);
    }
  },

  // user is not authenticated and does not have a valid refresh token
  async (context) => {
    let nonce;
    try {
      nonce = await generateLoginFormNonce();
    }
    catch (error) {
      logger.error(error);
      return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
    }
    const loginAsideProps = {
      loginFormProps: {
        email: '',
        nonce,
        validationErrors: []
      }
    }

    // return the login page
    return void sendOKHTMLResponse(context, await <LoginDocument loginAsideProps={loginAsideProps} />);
  }
])
