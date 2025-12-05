import { database as usersDatabase } from "@tw050x.net.library/database/collections/users";
import { generateLoginFormNonce } from "@tw050x.net.library/platform/helper/authentication/generate-login-form-nonce";
import { useLoginEnabled } from "@tw050x.net.library/platform/middleware/use-login-enabled";
import { useLoginEnabledGate } from "@tw050x.net.library/platform/middleware/use-login-enabled-gate";
import { useLoginState } from "@tw050x.net.library/platform/middleware/use-login-state";
import { default as LoginForm } from "@tw050x.net.library/platform/template/component/Form/LoginWithPassword";
import { read as readConfig } from "@tw050x.net.library/platform/helper/configs";
import { useCorsHeaders } from "@tw050x.net.library/platform/middleware/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/platform/middleware/use-log-request";
import { logger } from "@tw050x.net.library/platform/helper/logger";
import { default as defineServiceMiddleware } from "@tw050x.net.library/platform/middleware";
import { useSession } from "@tw050x.net.library/platform/middleware/use-session";
import { useSessionInitialiser } from "@tw050x.net.library/platform/middleware/use-session-initialiser";
import { default as Unrecoverable } from "@tw050x.net.library/platform/template/document/Unrecoverable";
import { compare } from "bcryptjs";
import { default as validator } from "validator";
import { default as zod, ZodError } from "zod";

const postLoginFormDataSchema = zod.object({
  email: zod.string().email('An email address is required'),
  password: zod.string().nonempty('A password is required'),
});

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders({
    allowedMethods: ['GET', 'OPTIONS', 'POST'],
  }),
  useLoginEnabled(),
  useLoginEnabledGate(),
  useLoginState(),
  useSession({
    activity: 'post-user-login-route',
  }),
  useSessionInitialiser(),

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
      userProfileDocument = await usersDatabase.profiles.findOne({ email });
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
      credentialDocument = await usersDatabase.credentials.findOne({
        userProfileUuid: userProfileDocument.uuid,
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

    // initialise the authentication token cookies
    try {
      await context.serverResponse.sessionInitialiser.initialise(userProfileDocument.uuid);
    }
    catch (error) {
      logger.error(error);
      logger.debug('failed to initialise authentication token cookies');

      return void context.serverResponse.sendInternalServerErrorHTMLResponse(
        <Unrecoverable />
      );
    }

    // clear the login state cookie
    context.serverResponse.loginState.cookie.clear();

    // redirect to the return url or the home page;
    return void context.serverResponse.sendSeeOtherRedirect(
      context.incomingMessage.loginState.cookie.payload?.returnUrl || new URL('/', `https://${readConfig('service.*.host')}`)
    )
  },
])
