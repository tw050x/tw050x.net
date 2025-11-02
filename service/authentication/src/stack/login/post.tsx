import { readParameter, useParameter } from "@tw050x.net.library/configuration";
import { database as userDatabase } from "@tw050x.net.database/user";
import { useAccessTokenCookie, UseAccessTokenCookieOptions } from "@tw050x.net.library/middleware/use-access-token-cookie";
import { useCorsHeaders, UseCorsHeadersFactoryOptions } from "@tw050x.net.library/middleware/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/middleware/use-login-state-cookie";
import { UseRefreshTokenCookieOptions, useRefreshTokenCookie } from "@tw050x.net.library/middleware/use-refresh-token-cookie";
import { UseRefreshableTokenCookieOptions, useRefreshableTokenCookie } from "@tw050x.net.library/middleware/use-refreshable-token-cookie";
import { logger } from "@tw050x.net.library/logger";
import { readSecret, useSecret } from "@tw050x.net.library/secret";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { compare } from "bcryptjs";
import { default as jwt, SignOptions } from "jsonwebtoken";
import { default as validator } from "validator";
import { default as zod, ZodError } from "zod";
import { generateLoginFormNonce } from "../../helper/generate-login-form-nonce.js";
import { default as LoginForm } from "../../template/component/LoginForm.js";

const postLoginFormDataSchema = zod.object({
  email: zod.string().email('An email address is required'),
  password: zod.string().nonempty('A password is required'),
});

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS', 'POST'],
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

const useRefreshableTokenCookieOptions: UseRefreshableTokenCookieOptions ={
  cookieName: useParameter('cookie.refreshable-token.name'),
  cookieDomain: useParameter('cookie.refreshable-token.domain'),
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useAccessTokenCookie(useAccessTokenCookieOptions),
  useLoginStateCookie(useLoginStateCookieOptions),
  useRefreshTokenCookie(useRefreshTokenCookieOptions),
  useRefreshableTokenCookie(useRefreshableTokenCookieOptions),

  // Render the login page in a disabled if it is not enabled
  async (context) => {
    const loginEnabled = await readParameter('authentication.service.login-enabled');
    if (loginEnabled === 'false') {
      return void context.serverResponse.sendOKHTMLResponse(
        <span>Login is currently disabled</span>
      );
    }
  },

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
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
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
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
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
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
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

    const jwtSecretKey = await readSecret('jwt.secret-key');
    if (jwtSecretKey === undefined) {
      logger.error('JWT secret key is undefined');
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
    }

    // create authentication cookies and set them on the response
    const refreshTokenOptions: SignOptions = {
      expiresIn: '4w',
    };
    const refreshTokenPayload = {
      sub: userProfileDocument.uuid
    };
    const accessTokenOptions: SignOptions = {
      expiresIn: '1d',
    };
    const accessTokenPayload = {
      sub: userProfileDocument.uuid
    };
    const refreshToken = jwt.sign(refreshTokenPayload, jwtSecretKey, refreshTokenOptions);
    const accessToken = jwt.sign(accessTokenPayload, jwtSecretKey, accessTokenOptions);

    // set the cookies on the response and clear the login state cookie
    context.serverResponse.refreshableTokenCookie.set('true');
    context.serverResponse.refreshTokenCookie.set(refreshToken);
    context.serverResponse.accessTokenCookie.set(accessToken);
    context.serverResponse.loginStateCookie.clear();

    // redirect to the return url or the home page;
    return void context.serverResponse.sendSeeOtherRedirect(
      context.incomingMessage.loginStateCookie.payload?.returnUrl || new URL('/', `https://${await readParameter('authentication.service.host')}`)
    )
  },
])
