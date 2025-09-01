import { database } from '@tw050x.net/database';
import { useAccessTokenCookieWriter } from "@tw050x.net/middleware/use-access-token-cookie-writer";
import { useCors } from "@tw050x.net/middleware/use-cors";
import { useLoginStateCookieReader } from "@tw050x.net/middleware/use-login-state-cookie-reader";
import { useLoginStateCookieWriter } from "@tw050x.net/middleware/use-login-state-cookie-writer";
import { useRefreshTokenCookieWriter } from "@tw050x.net/middleware/use-refresh-token-cookie-writer";
import { useRefreshableTokenCookieWriter } from "@tw050x.net/middleware/use-refreshable-token-cookie-writer";
import { logger } from "@tw050x.net/logger";
import { defineServiceMiddleware } from "@tw050x.net/service";
import { getFormDataBody } from "@tw050x.net/service/helper/get-form-data-body";
import { sendSeeOtherRedirect } from "@tw050x.net/service/helper/redirect/send-see-other-redirect";
import { sendBadRequestHTMLResponse } from "@tw050x.net/service/helper/response/send-bad-request-html-response";
import { sendInternalServerErrorHTMLResponse } from "@tw050x.net/service/helper/response/send-internal-server-error-html-response";
import { default as UnrecoverableDocument } from "@tw050x.net/uikit/document/Unrecoverable";
import { compare } from "bcryptjs";
import { SignOptions, sign } from "jsonwebtoken";
import { escape, trim } from "validator";
import { default as zod, ZodError } from "zod";
import { generateLoginFormNonce } from '../../helper/generate-login-form-nonce';
import { default as LoginForm } from '../../template/component/LoginForm';

const postLoginFormDataSchema = zod.object({
  email: zod.string().email('An email address is required'),
  password: zod.string().nonempty('A password is required'),
});

export default defineServiceMiddleware([
  async (context) => {
    logger.debug(`POST ${context.incomingMessage.url}`);
  },
  useCors({
    getConfiguration: async (configuration) => ({
      allowedMethods: ['GET', 'POST', 'OPTIONS'],
      allowedOrigins: configuration.get('authentication.service.allowed-origins'),
    }),
  }),
  useAccessTokenCookieWriter({
    getConfiguration: async (configuration) => ({
      cookieName: configuration.get('cookie.access-token.name'),
      cookieDomain: configuration.get('cookie.access-token.domain'),
    }),
  }),
  useLoginStateCookieReader({
    getConfiguration: async (configuration) => ({
      allowedReturnUrlDomains: configuration.get('authentication.service.allowed-return-url-domains'),
      cookieName: configuration.get('cookie.login-state.name'),
    }),
    getSecrets: async (secrets) => ({
      encrypterSecretKey: secrets.get('encrypter.secret-key'),
    }),
  }),
  useLoginStateCookieWriter({
    getConfiguration: async (configuration) => ({
      cookieName: configuration.get('cookie.login-state.name'),
      cookieDomain: configuration.get('cookie.login-state.domain'),
    }),
    getSecrets: async (secrets) => ({
      encrypterSecretKey: secrets.get('encrypter.secret-key'),
    }),
  }),
  useRefreshTokenCookieWriter({
    getConfiguration: async (configuration) => ({
      cookieName: configuration.get('cookie.refresh-token.name'),
      cookieDomain: configuration.get('cookie.refresh-token.domain'),
    }),
  }),
  useRefreshableTokenCookieWriter({
    getConfiguration: async (configuration) => ({
      cookieName: configuration.get('cookie.refreshable-token.name'),
      cookieDomain: configuration.get('cookie.refreshable-token.domain'),
    }),
  }),
  async (context) => {
    const body = await getFormDataBody(context);

    //
    let nonce;
    try {
      nonce = await generateLoginFormNonce();
    }
    catch (error) {
      logger.error('unable to generate nonce', { error });
      return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
    }

    // validate the email and password fields
    // return an error if they are invalid
    let email;
    let password;
    try {
      const result = postLoginFormDataSchema.parse(body);
      email = escape(trim(result.email));
      password = escape(trim(result.password));
    }
    catch (error) {
      if (error instanceof ZodError) error.errors.forEach((issue) => logger.error('unable to parse incoming message body field', { issue }));
      else logger.error('unable to parse incoming message body fields', { error });
      return void sendBadRequestHTMLResponse(
        context,
        await <LoginForm
          email={email}
          nonce={nonce}
          validationErrors={[{ message: 'Invalid email or password' }]}
        />
      );
    }

    // fetch the credentials document from the database
    // if it doesnt exist then return an error
    let credentialDocument;
    try {
      credentialDocument = await database.authentication.credentials.findOne({ email });
    }
    catch (error) {
      logger.error('error when finding database document', { error });
      return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
    }
    if (credentialDocument === null) {
      logger.error('credential document not found', { email });
      return void sendBadRequestHTMLResponse(
        context,
        await <LoginForm
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
      return void sendBadRequestHTMLResponse(
        context,
        await <LoginForm
          email={email}
          nonce={nonce}
          validationErrors={[{ message: 'Invalid email or password' }]}
        />
      );
    }

    // fetch the user permissions
    // return an error if unable to fetch the user permissions
    let permissionsDocuments;
    try {
      permissionsDocuments = await database.authentication.permissions.find({
        user_uuid: credentialDocument.uuid,
        enabled: true
      }).toArray();
    }
    catch (error) {
      logger.error('unable to fetch user permissions', { error });
      return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
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
      rol: permissionsDocuments.map((document) => document.key),
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
