import { CredentialDocument, client as userDatabaseClient, database as userDatabase } from "@tw050x.net.database/user";
import { logger } from "@tw050x.net.library/logger";
import { useAccessTokenCookieWriter } from "@tw050x.net.library/middleware/use-access-token-cookie-writer";
import { useCors } from "@tw050x.net.library/middleware/use-cors"
import { useLoginStateCookieReader } from "@tw050x.net.library/middleware/use-login-state-cookie-reader";
import { useLoginStateCookieWriter } from "@tw050x.net.library/middleware/use-login-state-cookie-writer";
import { useRefreshTokenCookieWriter } from "@tw050x.net.library/middleware/use-refresh-token-cookie-writer";
import { useRefreshableTokenCookieWriter } from "@tw050x.net.library/middleware/use-refreshable-token-cookie-writer";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { getFormDataBody } from "@tw050x.net.library/service/helper";
import { sendSeeOtherRedirect } from "@tw050x.net.library/service/helper/redirect/send-see-other-redirect";
import { sendBadRequestHTMLResponse } from "@tw050x.net.library/service/helper/response/send-bad-request-html-response";
import { sendInternalServerErrorHTMLResponse } from "@tw050x.net.library/service/helper/response/send-internal-server-error-html-response";
import { sendOKHTMLResponse } from "@tw050x.net.library/service/helper/response/send-ok-html-response";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { randomUUID } from "node:crypto"
import { hash } from "bcryptjs";
import { SignOptions, sign } from "jsonwebtoken";
import { default as zod, ZodError } from "zod";
import { generateRegisterFormNonce } from "../../helper/generate-register-form-nonce";
import { default as RegisterForm } from "../../template/component/RegisterForm";

const postRegisterFormDataSchema = zod.object({
  email: zod.string().email('An email address is required'),
  password: zod.string().min(8, 'Password must be at least 8 characters long'),
  'password-confirmation': zod.string().min(8, 'Confirm Password must be at least 8 characters long'),
}).refine((data) => data.password === data['password-confirmation'], {
  message: 'Passwords do not match',
})

export default defineServiceMiddleware([
  async (context) => {
    logger.debug(`POST ${context.incomingMessage.url}`);
  },
  useCors({
    getConfiguration: async ({ configuration }) => ({
      allowedMethods: ['GET', 'OPTIONS', 'POST'],
      allowedOrigins: configuration.get('user.service.allowed-origins')
    })
  }),
  useAccessTokenCookieWriter({
    getConfiguration: async ({ configuration }) => ({
      cookieName: configuration.get('cookie.access-token.name'),
      cookieDomain: configuration.get('cookie.access-token.domain'),
    }),
  }),
  useLoginStateCookieReader({
    getConfiguration: async ({ configuration }) => ({
      allowedReturnUrlDomains: configuration.get('user.service.allowed-return-url-domains'),
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

  // Render the registration page in a disabled if it is not enabled
  async (context) => {
    const registrationEnabled = context.configuration.get('user.service.registration-enabled');
    if (registrationEnabled === 'false') {
      return void sendOKHTMLResponse(
        context,
        await <span>Registration is currently disabled</span>
      );
    }
  },

  // Handle the registration form submission
  async (context) => {
    const body = await getFormDataBody(context);

    // generate a nonce for the registration form
    let nonce;
    try {
      nonce = await generateRegisterFormNonce();
    }
    catch (error) {
      logger.error('unable to generate nonce', { error });
      return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
    }

    // validate the incoming form data
    // return an error if the data is invalid
    let email;
    let password;
    try {
      const result = postRegisterFormDataSchema.parse(body);
      email = result.email;
      password = result.password;
    }
    catch (error) {
      if (error instanceof ZodError) error.errors.forEach((issue) => logger.error('unable to parse incoming message body field', { issue }));
      else logger.error('unable to parse incoming message body fields', { error });
      return void sendOKHTMLResponse(
        context,
        await <RegisterForm
          email={body?.email ?? ''}
          nonce={nonce}
          validationErrors={[{ message: 'There was a problem with your email address or password, please try again.' }]}
        />
      );
    }

    // fetch the credentials document from the database
    // if it doesnt exist then return an error
    let credentialsDocument: CredentialDocument | null = null;
    try {
      credentialsDocument = await userDatabase.credentials.findOne({ email });
    }
    catch (error) {
      logger.error('unable to query for existing credentials document', { error });
      return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
    }
    if (credentialsDocument !== null) {
      logger.error('credentials document found, cannot register as a new user', { email });
      return void sendBadRequestHTMLResponse(
        context,
        await <RegisterForm
          email={body?.email}
          nonce={nonce}
          validationErrors={[{ message: 'Email already in use' }]}
        />
      )
    }

    // hash the password
    // return an error if there is a problem
    let passwordHash;
    try {
      passwordHash = await hash(password, 10);
    }
    catch (error) {
      logger.error('unable to hash password', { error });
      return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
    }

    // generate a unique (unused) UUID for the user
    // return an error if there is a problem
    let userProfileDocument;
    let userProfileUuid;
    do {
      userProfileUuid = randomUUID();
      try {
        userProfileDocument = await userDatabase.profile.findOne({
          uuid: userProfileUuid
        });
      }
      catch (error) {
        logger.error('unable to query for existing user document', { error });
        return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
      }
    } while (userProfileDocument !== null);

    // TODO: add mongo replica set support in docker compose to enable the transactions feature

    // start the user database session
    let userDatabaseSession = userDatabaseClient.startSession();

    // Create the user and credentials documents in the database
    // return an error if there is a problem
    userDatabaseSession.startTransaction();
    try {
      await userDatabase.profile.insertOne({
        createdAt: new Date(),
        updatedAt: new Date(),
        uuid: userProfileUuid,
      });
      await userDatabase.credentials.insertOne({
        createdAt: new Date(),
        email,
        passwordHash,
        updatedAt: new Date(),
        uuid: userProfileUuid,
      });
      await userDatabaseSession.commitTransaction();
    }
    catch (error) {
      await userDatabaseSession.abortTransaction();
      logger.error('unable to create user and credentials documents', { error });
      return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
    }

    // end the user database session
    userDatabaseSession.endSession();

    //
    const jwtSecretKey = context.secrets.get('jwt.secret-key');
    const refreshTokenOptions: SignOptions = {
      expiresIn: '4w',
    };
    const refreshTokenPayload = {
      sub: userProfileUuid
    };
    const accessTokenOptions: SignOptions = {
      expiresIn: '1d',
    };
    const accessTokenPayload = {
      sub: userProfileUuid
    };
    const refreshToken = sign(refreshTokenPayload, jwtSecretKey, refreshTokenOptions);
    const accessToken = sign(accessTokenPayload, jwtSecretKey, accessTokenOptions);
    context.serverResponse.refreshableTokenCookie.set('true');
    context.serverResponse.refreshTokenCookie.set(refreshToken);
    context.serverResponse.accessTokenCookie.set(accessToken);
    context.serverResponse.loginStateCookie.clear();
    const returnUrl = context.incomingMessage.loginStateCookie.payload?.returnUrl || new URL('/', `https://${context.configuration.get('user.service.host')}/portal/dashboard`);
    return void sendSeeOtherRedirect(
      context,
      returnUrl
    )
  }
])
