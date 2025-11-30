import { client as userDatabaseClient, database as userDatabase } from "@tw050x.net.database/user";
import { sanitizeMongoDBFilterOrPipeline } from "@tw050x.net.library/database";
import { read as readConfig } from "@tw050x.net.library/configs";
import { logger } from "@tw050x.net.library/logger";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { useLogRequest } from "@tw050x.net.library/middleware";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { useSession } from "@tw050x.net.library/sessions/middleware/use-session";
import { useSessionInitialiser } from "@tw050x.net.library/sessions/middleware/use-session-initialiser";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { generateRegisterFormNonce } from "@tw050x.net.library/user/helper/generate-register-form-nonce";
import { useLoginState } from "@tw050x.net.library/user/middleware/use-login-state";
import { useRegistrationEnabledGate } from "@tw050x.net.library/user/middleware/use-registration-enabled-gate";
import { userEventQueue } from "@tw050x.net.library/user/queue/user-event-queue";
import { default as RegisterForm } from "@tw050x.net.library/user/template/component/RegisterForm";
import { normaliseEmailAddress } from "@tw050x.net.library/utility/normalise-email-address";
import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import { default as zod, ZodError } from "zod";

const postRegisterFormDataSchema = zod
  .object({
    email: zod.string().email("An email address is required"),
    password: zod
      .string()
      .min(8, "Password must be at least 8 characters long"),
    "password-confirmation": zod
      .string()
      .min(8, "Confirm Password must be at least 8 characters long"),
  })
  .refine((data) => data.password === data["password-confirmation"], {
    message: "Passwords do not match",
  });

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ["GET", "OPTIONS", "POST"],
};

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useRegistrationEnabledGate(),
  useLoginState(),
  useSession({
    activity: 'post-user-register-route',
  }),
  useSessionInitialiser(),

  // Handle the registration form submission
  async (context) => {
    const body = await context.incomingMessage.useFormDataBody();
    logger.debug("Parsed incoming form data", { body });

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
      if (error instanceof ZodError)
        error.errors.forEach((issue) => logger.error(issue));
      else logger.error(error);
    }
    logger.debug("Ran post register form data schema validation", {
      emailFieldValue,
      passwordFieldValue,
    });

    // if there was a problem with the data, re-render the registration form with a generic error message
    // to avoid disclosing which field was incorrect
    if (emailFieldValue === undefined || passwordFieldValue === undefined) {
      let nonce;
      try {
        nonce = await generateRegisterFormNonce();
      }
      catch (error) {
        logger.error(error);
        return void context.serverResponse.sendInternalServerErrorHTMLResponse(
          <UnrecoverableDocument />
        );
      }

      return void context.serverResponse.sendOKHTMLResponse(
        <RegisterForm
          email={body?.email ?? ""}
          nonce={nonce}
          validationErrors={[
            {
              message:
                "There was a problem with your email address or password, please try again",
            },
          ]}
        />
      );
    }
    logger.debug("Register form data is valid");

    //
    let normalisedEmailAddress;
    try {
      normalisedEmailAddress = normaliseEmailAddress(emailFieldValue);
    }
    catch (error) {
      logger.error(error);
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(
        <UnrecoverableDocument />
      );
    }

    //
    let userProfileDocument;
    try {
      userProfileDocument = await userDatabase.profiles.findOne(
        sanitizeMongoDBFilterOrPipeline({
          emailNormalised: normalisedEmailAddress,
        })
      );
    }
    catch (error) {
      logger.error(error);
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(
        <UnrecoverableDocument />
      );
    }
    logger.debug("Checked for existing user profile document", {
      userProfileDocument,
    });
    if (userProfileDocument !== null) {
      let nonce;
      try {
        nonce = await generateRegisterFormNonce();
      }
      catch (error) {
        logger.error(error);
        return void context.serverResponse.sendInternalServerErrorHTMLResponse(
          <UnrecoverableDocument />
        );
      }

      return void context.serverResponse.sendOKHTMLResponse(
        <RegisterForm
          email={body?.email ?? ""}
          nonce={nonce}
          validationErrors={[
            { message: "This email address is already registered" },
          ]}
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
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(
        <UnrecoverableDocument />
      );
    }

    // generate a unique (unused) UUID for the user
    // return an error if there is a problem
    let userProfileUuid;
    do {
      userProfileUuid = randomUUID();
      try {
        userProfileDocument = await userDatabase.profiles.findOne({
          uuid: userProfileUuid,
        });
      }
      catch (error) {
        logger.error(error);
        return void context.serverResponse.sendInternalServerErrorHTMLResponse(
          <UnrecoverableDocument />
        );
      }
    }
    while (userProfileDocument !== null);

    // start the user database session
    const userDatabaseSession = userDatabaseClient.startSession();

    // Create the user and credentials documents in the database
    // return an error if there is a problem
    userDatabaseSession.startTransaction();
    try {
      await userDatabase.profiles.insertOne({
        createdAt: new Date(),
        updatedAt: new Date(),
        email: emailFieldValue,
        emailNormalised: normalisedEmailAddress,
        uuid: userProfileUuid,
      });
      await userDatabase.credentials.insertOne({
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash,
        type: "password",
        userProfileUuid,
      });
      await userDatabaseSession.commitTransaction();
    }
    catch (error) {
      logger.error(error);
      await userDatabaseSession.abortTransaction();
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(
        <UnrecoverableDocument />
      );
    }
    finally {
      // end the user database session
      await userDatabaseSession.endSession();
    }

    // send a message to the event queue indicating a new user has registered
    // log any errors but do not fail the registration
    try {
      await userEventQueue.add('UserRegistered', {
        userProfileUuid
      });
    }
    catch (error) {
      // We can survive a failure to send the message, so just log it
      logger.error(error);
    }

    // Initialize the session token cookie for the user
    try {
      await context.serverResponse.sessionInitialiser.initialise(userProfileUuid);
    }
    catch (error) {
      logger.error(error);
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(
        <UnrecoverableDocument />
      );
    }

    // Clear the login state cookie
    context.serverResponse.loginState.cookie.clear();

    // Redirect the user to the portal
    return void context.serverResponse.sendSeeOtherRedirect(
      new URL(
        "/portal",
        `https://${readConfig("service.*.host")}`
      )
    );
  },
]);
