import { useAccessTokenCookie, UseAccessTokenCookieOptions } from "@tw050x.net.library/authentication/middleware/use-access-token-cookie";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/authentication/middleware/use-login-state-cookie";
import { UseRefreshTokenCookieOptions, useRefreshTokenCookie } from "@tw050x.net.library/authentication/middleware/use-refresh-token-cookie";
import { database as userDatabase } from "@tw050x.net.database/user";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { logger } from "@tw050x.net.library/logger";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { compare } from "bcryptjs";
import { default as jwt, SignOptions } from "jsonwebtoken";
import { default as validator } from "validator";
import { default as zod, ZodError } from "zod";
import { generateLoginFormNonce } from "../../helper/generate-login-form-nonce.js";
import { useLoginEnabledGate } from "../../middleware/use-login-enabled-gate.js";
import { default as LoginForm } from "../../template/component/LoginWithPasswordForm.js";
import { serviceParameters } from "../../parameters.js";
import { serviceSecrets } from "../../secrets.js";

const postLoginFormDataSchema = zod.object({
  email: zod.string().email('An email address is required'),
  password: zod.string().nonempty('A password is required'),
});

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS', 'POST'],
  allowedOrigins: serviceParameters.getParameter('user.service.allowed-origins'),
}

const useAccessTokenCookieOptions: UseAccessTokenCookieOptions = {
  cookieName: serviceParameters.getParameter('cookie.access-token.name'),
  cookieDomain: serviceParameters.getParameter('cookie.access-token.domain'),
  jwtSecretKey: serviceSecrets.getSecret('jwt.secret-key'),
}

const useLoginStateCookieOptions: UseLoginStateCookieOptions = {
  cookieName: serviceParameters.getParameter('cookie.login-state.name'),
  cookieDomain: serviceParameters.getParameter('cookie.login-state.domain'),
  encrypterSecretKey: serviceSecrets.getSecret('encrypter.secret-key'),
}

const useRefreshTokenCookieOptions: UseRefreshTokenCookieOptions = {
  cookieDomain: serviceParameters.getParameter('cookie.refresh-token.domain'),
  jwtSecretKey: serviceSecrets.getSecret('jwt.secret-key'),
  refreshCookieName: serviceParameters.getParameter('cookie.refresh-token.name'),
  refreshableCookieName: serviceParameters.getParameter('cookie.refreshable-token.name'),
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useAccessTokenCookie(useAccessTokenCookieOptions),
  useLoginStateCookie(useLoginStateCookieOptions),
  useRefreshTokenCookie(useRefreshTokenCookieOptions),
  useLoginEnabledGate(),

  // Handle the login form submission
  async (context) => {
    const body = await context.incomingMessage.useFormDataBody();

    // generate a nonce for the login form
    let nonce;
    try {
      nonce = await generateLoginFormNonce();
    }
    catch (error) {
      logger.error(error);
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
    }

    // validate the email and password fields
    // return an error if the data is invalid
    let email;
    let password;
    try {
      const result = postLoginFormDataSchema.parse(body);
      email = validator.escape(validator.trim(result.email));
      password = validator.escape(validator.trim(result.password));
    }
    catch (error) {
      if (error instanceof ZodError) error.errors.forEach((issue) => logger.error(issue));
      else logger.error(error);
      return void context.serverResponse.sendBadRequestHTMLResponse(
        <LoginForm
          email={body?.email}
          nonce={nonce}
          validationErrors={[{ message: 'Invalid email or password' }]}
        />
      );
    }

    // fetch the credentials document from the database
    // if it doesnt exist then return an error
    let userProfileDocument;
    try {
      userProfileDocument = await userDatabase.profile.findOne({ email });
    }
    catch (error) {
      logger.error(error);
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
    }
    if (userProfileDocument === null) {
      logger.debug('credential document not found', { email });
      return void context.serverResponse.sendBadRequestHTMLResponse(
        <LoginForm
          email={body?.email}
          nonce={nonce}
          validationErrors={[{ message: 'Invalid email or password' }]}
        />
      );
    }

    // fetch the credential document from the database
    // if it doesnt exist then return an error
    let credentialDocument;
    try {
      credentialDocument = await userDatabase.credentials.findOne({
        userProfileId: userProfileDocument._id,
        type: 'password',
      });
    }
    catch (error) {
      logger.debug('credential document fetch error', { email });
      logger.error(error);
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(
        <Unrecoverable />
      );
    }
    if (credentialDocument === null) {
      logger.debug('credential document not found', { email });
      return void context.serverResponse.sendBadRequestHTMLResponse(
        <LoginForm
          email={email}
          nonce={nonce}
          validationErrors={[{ message: 'Invalid email or password' }]}
        />
      );
    }

    // ensure the credential document is of type password
    if (credentialDocument.type !== 'password') {
      logger.debug('credential document is not of type password', { email });
      return void context.serverResponse.sendBadRequestHTMLResponse(
        <Unrecoverable />
      );
    }

    // compare the password hash with the password using bcryptjs compare
    // if it doesnt match then return an error
    const passwordMatch = await compare(password, credentialDocument.passwordHash);
    if (passwordMatch === false) {
      logger.error('password does not match', { email });
      return void context.serverResponse.sendBadRequestHTMLResponse(
        <LoginForm
          email={email}
          nonce={nonce}
          validationErrors={[{ message: 'Invalid email or password' }]}
        />
      );
    }

    const jwtSecretKey = serviceSecrets.getSecret('jwt.secret-key');
    if (jwtSecretKey === undefined) {
      logger.error('JWT secret key is undefined');
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<Unrecoverable />);
    }

    // generate a new access token
    const accessTokenOptions: SignOptions = {
      expiresIn: '1d',
    };
    const accessTokenPayload = {
      sub: userProfileDocument.uuid
    };
    const accessToken = jwt.sign(accessTokenPayload, jwtSecretKey, accessTokenOptions);

    // generate a new refresh token
    const refreshTokenOptions: SignOptions = {
      expiresIn: '4w',
    };
    const refreshTokenPayload = {
      sub: userProfileDocument.uuid
    };
    const refreshToken = jwt.sign(refreshTokenPayload, jwtSecretKey, refreshTokenOptions);

    // set the cookies on the response and clear the login state cookie
    context.serverResponse.refreshTokenCookie.set(refreshToken);
    context.serverResponse.accessTokenCookie.set(accessToken);
    context.serverResponse.loginStateCookie.clear();

    // redirect to the return url or the home page;
    return void context.serverResponse.sendSeeOtherRedirect(
      context.incomingMessage.loginStateCookie.payload?.returnUrl || new URL('/', `https://${serviceParameters.getParameter('user.service.host')}`)
    )
  },
])
