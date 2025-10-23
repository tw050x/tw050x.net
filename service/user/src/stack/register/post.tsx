import { readParameter, useParameter } from "@tw050x.net.library/configuration";
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
import { sendMessage } from "@tw050x.net.library/queue";
import { readSecret } from "@tw050x.net.library/secret";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
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
    const body = await context.incomingMessage.useFormDataBody();
    logger.debug('Parsed incoming form data', { body });

    // validate the incoming form data
    // return an error if the data is invalid
    let emailFieldValue: string | undefined;
    let passwordFieldValue: string | undefined;
    try {
      const result = postRegisterFormDataSchema.parse(body);
      emailFieldValue = result.email;
      passwordFieldValue = result.password;
    }
    catch (error) {
      if (error instanceof ZodError) error.errors.forEach((issue) => logger.error(issue));
      else logger.error(error);
    }
    logger.debug('Ran post register form data schema validation', { emailFieldValue, passwordFieldValue });

    // if there was a problem with the data, re-render the registration form with a generic error message
    // to avoid disclosing which field was incorrect
    if (emailFieldValue === undefined || passwordFieldValue === undefined) {
      let nonce;
      try {
        nonce = await generateRegisterFormNonce();
      }
      catch (error) {
        logger.error(error);
        return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
      }

      return void context.serverResponse.sendOKHTMLResponse(
        <RegisterForm
          email={body?.email ?? ''}
          nonce={nonce}
          validationErrors={[{ message: 'There was a problem with your email address or password, please try again' }]}
        />
      );
    }
    logger.debug('Register form data is valid', { emailFieldValue, passwordFieldValue });

    // fetch the credentials document from the database
    // if the credentials document already exists, re-render the registration form with a generic error message
    let credentialsDocument: CredentialDocument | null = null;
    try {
      credentialsDocument = await userDatabase.credentials.findOne(
        sanitizeMongoDBFilterOrPipeline({ email: emailFieldValue })
      );
    }
    catch (error) {
      logger.error(error);
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
    }
    if (credentialsDocument !== null) {
      let nonce;
      try {
        nonce = await generateRegisterFormNonce();
      }
      catch (error) {
        logger.error(error);
        return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
      }

      return void context.serverResponse.sendOKHTMLResponse(
        <RegisterForm
          email={body?.email ?? ''}
          nonce={nonce}
          validationErrors={[{ message: 'This email address is already registered' }]}
        />
      );
    }

    // hash the password
    // return an error if there is a problem
    let passwordHash;
    try {
      passwordHash = await hash(passwordFieldValue, 10);
    }
    catch (error) {
      logger.error(error);
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
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
        return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
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
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
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
        email: emailFieldValue,
        passwordHash,
        uuid: userProfileUuid,
      });
      // await assignmentDatabase.task.insertMany(registrationTasks); // TODO: replace with SQS event that ultimately triggers task creation
      await userDatabaseSession.commitTransaction();
    }
    catch (error) {
      await userDatabaseSession.abortTransaction();
      logger.error(error);
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
    }
    // end the user database session
    await userDatabaseSession.endSession();

    // send a message to the event queue indicating a new user has registered
    // log any errors but do not fail the registration
    try {
      const eventQueueUrl = await readParameter('user.service.event-queue-url');
      await sendMessage(eventQueueUrl, {
        eventType: 'UserRegistered',
        userProfileUuid,
      });
    }
    catch (error) {
      // We can survive a failure to send the message, so just log it
      logger.error(error);
    }

    // read the JWT secret key
    // return an error if there is a problem
    const jwtSecretKey = await readSecret('jwt.secret-key');
    if (jwtSecretKey === undefined) {
      logger.error('JWT secret key is undefined');
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
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
    context.serverResponse.loginStateCookie.clear();;
    return void context.serverResponse.sendSeeOtherRedirect(
      new URL('/portal/assignment', `https://${await readParameter('user.service.host')}`)
    )
  }
])
