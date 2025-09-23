import { database as userDatabase } from "@tw050x.net.database/user";
import { useAccessTokenCookieWriter } from "@tw050x.net.library/middleware/use-access-token-cookie-writer";
import { useCors } from "@tw050x.net.library/middleware/use-cors";
import { useLoginStateCookieReader } from "@tw050x.net.library/middleware/use-login-state-cookie-reader";
import { useLoginStateCookieWriter } from "@tw050x.net.library/middleware/use-login-state-cookie-writer";
import { useRefreshTokenCookieWriter } from "@tw050x.net.library/middleware/use-refresh-token-cookie-writer";
import { useRefreshableTokenCookieWriter } from "@tw050x.net.library/middleware/use-refreshable-token-cookie-writer";
import { logger } from "@tw050x.net.library/logger";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { getFormDataBody } from "@tw050x.net.library/service/helper/get-form-data-body";
import { sendSeeOtherRedirect } from "@tw050x.net.library/service/helper/redirect/send-see-other-redirect";
import { sendBadRequestHTMLResponse } from "@tw050x.net.library/service/helper/response/send-bad-request-html-response";
import { sendInternalServerErrorHTMLResponse } from "@tw050x.net.library/service/helper/response/send-internal-server-error-html-response";
import { sendOKHTMLResponse } from "@tw050x.net.library/service/helper/response/send-ok-html-response";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { compare } from "bcryptjs";
import { SignOptions, sign } from "jsonwebtoken";
import { escape, trim } from "validator";
import { default as zod, ZodError } from "zod";
import { generateLoginFormNonce } from "../../helper/generate-login-form-nonce";
import { default as LoginForm } from "../../template/component/LoginForm";

const postLoginFormDataSchema = zod.object({
  email: zod.string().email('An email address is required'),
  password: zod.string().nonempty('A password is required'),
});

export default defineServiceMiddleware([
  async (context) => {
    logger.debug(`POST ${context.incomingMessage.url}`);
  },
  useCors({
    getConfiguration: async ({ configuration }) => ({
      allowedMethods: ['GET', 'OPTIONS', 'POST'],
      allowedOrigins: configuration.get('authentication.service.allowed-origins'),
    }),
  }),
  useAccessTokenCookieWriter({
    getConfiguration: async ({ configuration }) => ({
      cookieName: configuration.get('cookie.access-token.name'),
      cookieDomain: configuration.get('cookie.access-token.domain'),
    }),
  }),
  useLoginStateCookieReader({
    getConfiguration: async ({ configuration }) => ({
      allowedReturnUrlDomains: configuration.get('authentication.service.allowed-return-url-domains'),
      cookieName: configuration.get('cookie.login-state.name'),
    }),
    getSecrets: async ({ secrets }) => ({
      encrypterSecretKey: secrets.get('encrypter.secret-key'),
    }),
  }),
  useLoginStateCookieWriter({
    getConfiguration: async ({ configuration }) => ({
      cookieName: configuration.get('cookie.login-state.name'),
      cookieDomain: configuration.get('cookie.login-state.domain'),
    }),
    getSecrets: async ({ secrets }) => ({
      encrypterSecretKey: secrets.get('encrypter.secret-key'),
    }),
  }),
  useRefreshTokenCookieWriter({
    getConfiguration: async ({ configuration }) => ({
      cookieName: configuration.get('cookie.refresh-token.name'),
      cookieDomain: configuration.get('cookie.refresh-token.domain'),
    }),
  }),
  useRefreshableTokenCookieWriter({
    getConfiguration: async ({ configuration }) => ({
      cookieName: configuration.get('cookie.refreshable-token.name'),
      cookieDomain: configuration.get('cookie.refreshable-token.domain'),
    }),
  }),

  // Render the login page in a disabled if it is not enabled
  async (context) => {
    const loginEnabled = context.configuration.get('authentication.service.login-enabled');
    if (loginEnabled === 'false') {
      return void sendOKHTMLResponse(
        context,
        await <span>Login is currently disabled</span>
      );
    }
  },

  // Handle the login form submission
  async (context) => {
    const body = await getFormDataBody(context);

    // generate a nonce for the login form
    let nonce;
    try {
      nonce = await generateLoginFormNonce();
    }
    catch (error) {
      logger.error(error);
      return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
    }

    // validate the email and password fields
    // return an error if the data is invalid
    let email;
    let password;
    try {
      const result = postLoginFormDataSchema.parse(body);
      email = escape(trim(result.email));
      password = escape(trim(result.password));
    }
    catch (error) {
      if (error instanceof ZodError) error.errors.forEach((issue) => logger.error(issue));
      else logger.error(error);
      return void sendBadRequestHTMLResponse(
        context,
        await <LoginForm
          email={body?.email}
          nonce={nonce}
          validationErrors={[{ message: 'Invalid email or password' }]}
        />
      );
    }

    // fetch the credentials document from the database
    // if it doesnt exist then return an error
    let credentialDocument;
    try {
      credentialDocument = await userDatabase.credentials.findOne({ email });
    }
    catch (error) {
      logger.error(error);
      return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
    }
    if (credentialDocument === null) {
      logger.debug('credential document not found', { email });
      return void sendBadRequestHTMLResponse(
        context,
        await <LoginForm
          email={body?.email}
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
      return void sendBadRequestHTMLResponse(
        context,
        await <LoginForm
          email={email}
          nonce={nonce}
          validationErrors={[{ message: 'Invalid email or password' }]}
        />
      );
    }

    // create authentication cookies and set them on the response
    const jwtSecretKey = context.secrets.get('jwt.secret-key');
    const refreshTokenOptions: SignOptions = {
      expiresIn: '4w',
    };
    const refreshTokenPayload = {
      sub: credentialDocument.uuid
    };
    const accessTokenOptions: SignOptions = {
      expiresIn: '1d',
    };
    const accessTokenPayload = {
      sub: credentialDocument.uuid
    };
    const refreshToken = sign(refreshTokenPayload, jwtSecretKey, refreshTokenOptions);
    const accessToken = sign(accessTokenPayload, jwtSecretKey, accessTokenOptions);
    context.serverResponse.refreshableTokenCookie.set('true');
    context.serverResponse.refreshTokenCookie.set(refreshToken);
    context.serverResponse.accessTokenCookie.set(accessToken);
    context.serverResponse.loginStateCookie.clear();
    const returnUrl = context.incomingMessage.loginStateCookie.payload?.returnUrl || new URL('/', `https://${context.configuration.get('authentication.service.host')}`);
    return void sendSeeOtherRedirect(
      context,
      returnUrl
    )
  },
])
