import { readParameter, useParameter } from "@tw050x.net.library/configuration";
import { database as assignmentDatabase } from "@tw050x.net.database/assignment";
import { CredentialDocument, client as userDatabaseClient, database as userDatabase } from "@tw050x.net.database/user";
import { sanitizeMongoDBFilterOrPipeline } from "@tw050x.net.library/database";
import { logger } from "@tw050x.net.library/logger";
import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/middleware/use-access-token-cookie";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/middleware/use-cors-headers"
import { useLogRequest } from "@tw050x.net.library/middleware";
import { useSecret } from "@tw050x.net.library/secret";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/middleware/use-login-state-cookie";
import { UseRefreshTokenCookieOptions, useRefreshTokenCookie } from "@tw050x.net.library/middleware/use-refresh-token-cookie";
import { UseRefreshableTokenCookieOptions, useRefreshableTokenCookie } from "@tw050x.net.library/middleware/use-refreshable-token-cookie";
import { readSecret } from "@tw050x.net.library/secret";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { useFormDataBody } from "@tw050x.net.library/service/helper";
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
import { generateRegistrationAssignmentTasks } from "../../helper/generate-registration-assignment-tasks";
import { RegistrationEnabledGateOptions, useRegistrationEnabledGate } from "../../middleware/use-registration-enabled-gate";
import { default as RegisterDocument } from "../../template/document/RegisterDocument";
import { default as RegisterForm } from "../../template/component/RegisterForm";

const postRegisterFormDataSchema = zod.object({
  email: zod.string().email('An email address is required'),
  password: zod.string().min(8, 'Password must be at least 8 characters long'),
  'password-confirmation': zod.string().min(8, 'Confirm Password must be at least 8 characters long'),
}).refine((data) => data.password === data['password-confirmation'], {
  message: 'Passwords do not match',
})

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS', 'POST'],
  allowedOrigins: useParameter('user.service.allowed-origins')
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

const useRegistrationEnabledGateOptions: RegistrationEnabledGateOptions = {
  getResponseHtml: async () => (
    <RegisterDocument
      registerAsideProps={{
        disabled: true,
        message: "Registration is currently disabled."
      }}
    />
  )
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useAccessTokenCookie(useAccessTokenCookieOptions),
  useLoginStateCookie(useLoginStateCookieOptions),
  useRefreshTokenCookie(useRefreshTokenCookieOptions),
  useRefreshableTokenCookie(useRefreshableTokenCookieOptions),
  useRegistrationEnabledGate(useRegistrationEnabledGateOptions),

  // Handle the registration form submission
  async (context) => {
    const body = await useFormDataBody(context);

    // generate a nonce for the registration form
    let nonce;
    try {
      nonce = await generateRegisterFormNonce();
    }
    catch (error) {
      logger.error(error);
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
      if (error instanceof ZodError) error.errors.forEach((issue) => logger.error(issue));
      else logger.error(error);
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
      credentialsDocument = await userDatabase.credentials.findOne(
        sanitizeMongoDBFilterOrPipeline({ email })
      );
    }
    catch (error) {
      logger.error(error);
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
      logger.error(error);
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
        logger.error(error);
        return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
      }
    }
    while (userProfileDocument !== null);


    // generate the initial registration tasks for the new user
    // return an error if there is a problem
    let registrationTasks;
    try {
      registrationTasks = await generateRegistrationAssignmentTasks({ userProfileUuid });
    }
    catch (error) {
      logger.error(error);
      return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
    }

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
        updatedAt: new Date(),
        email,
        passwordHash,
        uuid: userProfileUuid,
      });
      await assignmentDatabase.task.insertMany(registrationTasks);
      await userDatabaseSession.commitTransaction();
    }
    catch (error) {
      await userDatabaseSession.abortTransaction();
      logger.error(error);
      return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
    }
    // end the user database session
    userDatabaseSession.endSession();

    // read the JWT secret key
    // return an error if there is a problem
    const jwtSecretKey = await readSecret('jwt.secret-key');
    if (jwtSecretKey === undefined) {
      logger.error('JWT secret key is undefined');
      return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
    }

    // generate JWT tokens and set cookies
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
    const returnUrl = new URL('/portal/assignment', `https://${await readParameter('user.service.host')}`);
    return void sendSeeOtherRedirect(
      context,
      returnUrl
    )
  }
])
