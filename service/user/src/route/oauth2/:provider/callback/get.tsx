import { client as userDatabaseClient, database as userDatabase } from "@tw050x.net.database/user";
import { sanitizeMongoDBFilterOrPipeline } from "@tw050x.net.library/database";
import { read as readConfig } from "@tw050x.net.library/configs";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { decrypt, encrypt } from "@tw050x.net.library/encryption";
import { logger } from "@tw050x.net.library/logger";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { read as readSecret } from "@tw050x.net.library/secrets";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { useSession } from "@tw050x.net.library/sessions/middleware/use-session";
import { useSessionInitialiser } from "@tw050x.net.library/sessions/middleware/use-session-initialiser";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { useLoginEnabled } from "@tw050x.net.library/user/middleware/use-login-enabled";
import { useLoginEnabledGate } from "@tw050x.net.library/user/middleware/use-login-enabled-gate";
import { useLoginState } from "@tw050x.net.library/user/middleware/use-login-state";
import { googleAuthorisationURL, googleOAuth2ExchangeCodeForAccessTokenAndScope, googleFetchUserProfile, googleInsertUserOAuthCredentials } from "@tw050x.net.library/user/helper/oauth2/google";
import { default as OAuthCallback } from "@tw050x.net.library/user/template/document/OAuthCallback";
import { userEventQueue } from "@tw050x.net.library/user/queue/user-event-queue";
import { normaliseEmailAddress } from "@tw050x.net.library/utility/normalise-email-address";
import { randomUUID } from "node:crypto"

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'POST', 'OPTIONS'],
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useLoginEnabled(),
  useLoginEnabledGate(),
  useLoginState(),
  useSession({
    activity: 'get-user-oauth2-callback-route',
  }),
  useSessionInitialiser(),

  // user is not authenticated and does not have a valid refresh token
  async (context) => {
    const { provider } = await context.incomingMessage.useUrlParams('/oauth2/:provider/callback');
    const { code, error, state } = await context.incomingMessage.useUrlQuery();

    if (state === undefined) {
      logger.debug('Missing OAuth2 state in callback');
      return context.serverResponse.sendBadRequestHTMLResponse(
        <Unrecoverable />
      )
    }

    let decryptedState;
    try {
      decryptedState = decrypt(state, readSecret('encrypter.secret-key'));
    }
    catch (error) {
      logger.error(error);
      logger.debug('Failed to decrypt OAuth2 state in callback');
      return context.serverResponse.sendBadRequestHTMLResponse(
        <Unrecoverable />
      )
    }

    successfullyAuthenticationGuard: {
      if (error !== undefined) {
        break successfullyAuthenticationGuard;
      }

      if (code === undefined) {
        logger.debug('Missing OAuth2 code in callback');
        return context.serverResponse.sendBadRequestHTMLResponse(
          <OAuthCallback error="missing_oauth2_code" provider={provider} />
        )
      }

      let userProfileDocument;
      switch (provider) {
        case 'google':
          let oauthAccessTokenAndScope;
          try {
            oauthAccessTokenAndScope = await googleOAuth2ExchangeCodeForAccessTokenAndScope(code);
          }
          catch (error) {
            logger.error(error);
            logger.debug('Failed to exchange OAuth2 code for access token', { provider });
            return context.serverResponse.sendBadRequestHTMLResponse(
              <OAuthCallback error="failed_to_exchange_oauth2_code_for_token" provider={provider} />
            )
          }

          // check allowed scopes
          if (oauthAccessTokenAndScope.scope === null) {
            logger.debug('OAuth2 access token scope is null', { provider });
            return context.serverResponse.sendBadRequestHTMLResponse(
              <OAuthCallback error="insufficient_oauth2_scopes" provider={provider} />
            )
          }
          if (oauthAccessTokenAndScope.scope.includes('https://www.googleapis.com/auth/userinfo.email') === false) {
            logger.debug('OAuth2 access token missing required email scope', { provider, scopes: oauthAccessTokenAndScope.scope });
            return context.serverResponse.sendBadRequestHTMLResponse(
              <OAuthCallback error="insufficient_oauth2_scopes" provider={provider} />
            )
          }

          // use the access token to retrieve user info from Google
          let googleUserProfile;
          try {
            googleUserProfile = await googleFetchUserProfile(oauthAccessTokenAndScope.accessToken);
          }
          catch (error) {
            logger.error(error);
            logger.debug('Failed to fetch user profile from OAuth2 provider', { provider });
            return context.serverResponse.sendBadRequestHTMLResponse(
              <OAuthCallback error="failed_to_fetch_oauth2_user_profile" provider={provider} />
            )
          }

          if (('email' in googleUserProfile) === false) {
            logger.debug('OAuth2 user profile missing email', { provider });
            return context.serverResponse.sendBadRequestHTMLResponse(
              <OAuthCallback error="oauth2_user_profile_missing_email" provider={provider} />
            )
          }
          if (typeof googleUserProfile.email !== 'string') {
            logger.debug('OAuth2 user profile email is not a string', { provider });
            return context.serverResponse.sendBadRequestHTMLResponse(
              <OAuthCallback error="oauth2_user_profile_missing_email" provider={provider} />
            )
          }

          // normalise email address
          let normalisedGoogleUserProfileEmailAddress;
          try {
            normalisedGoogleUserProfileEmailAddress = normaliseEmailAddress(googleUserProfile.email);
          }
          catch (error) {
            logger.error(error);
            return void context.serverResponse.sendInternalServerErrorHTMLResponse(
              <Unrecoverable />
            );
          }

          try {
            userProfileDocument = await userDatabase.profiles.findOne(
              sanitizeMongoDBFilterOrPipeline({ emailNormalised: normalisedGoogleUserProfileEmailAddress })
            );
          }
          catch (error) {
            logger.error(error);
            return void context.serverResponse.sendInternalServerErrorHTMLResponse(
              <Unrecoverable />
            );
          }

          if (userProfileDocument === null) {
            let userProfileUuid;
            let userProfileDocumentByUuid;
            do {
              userProfileUuid = randomUUID();
              try {
                userProfileDocumentByUuid = await userDatabase.profiles.findOne({
                  uuid: userProfileUuid
                });
              }
              catch (error) {
                logger.error(error);
                return void context.serverResponse.sendInternalServerErrorHTMLResponse(
                  <Unrecoverable />
                );
              }
            }
            while (userProfileDocumentByUuid !== null);
            logger.debug('credential document not found, creating a new user', { email: googleUserProfile.email });

            // create a new user profile and credential document within a transaction
            const userDatabaseSession = userDatabaseClient.startSession();
            userDatabaseSession.startTransaction();
            try {
              const profile = await userDatabase.profiles.insertOne({
                createdAt: new Date(),
                updatedAt: new Date(),
                email: googleUserProfile.email,
                emailNormalised: normalisedGoogleUserProfileEmailAddress,
                uuid: userProfileUuid,
              });
              await googleInsertUserOAuthCredentials(userProfileUuid);
              await userDatabaseSession.commitTransaction();
            }
            catch (error) {
              logger.error(error);
              await userDatabaseSession.abortTransaction();
              return void context.serverResponse.sendInternalServerErrorHTMLResponse(
                <Unrecoverable />
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

            try {
              userProfileDocument = await userDatabase.profiles.findOne({
                uuid: userProfileUuid
              });
            }
            catch (error) {
              logger.error(error);
              logger.debug('Failed to fetch newly created user profile document');
              return void context.serverResponse.sendInternalServerErrorHTMLResponse(
                <Unrecoverable />
              );
            }
            if (userProfileDocument === null) {
              logger.error('Newly created user profile document not found');
              return void context.serverResponse.sendInternalServerErrorHTMLResponse(
                <Unrecoverable />
              );
            }
          }
          else {
            logger.debug('Existing user profile found for OAuth2 login', { email: googleUserProfile.email });

            let userOAuthCredentialDocument;
            try {
              userOAuthCredentialDocument = await userDatabase.credentials.findOne(
                sanitizeMongoDBFilterOrPipeline({
                  userProfileUuid: userProfileDocument.uuid,
                  provider: 'google',
                  type: 'oauth2',
                })
              );
            }
            catch (error) {
              logger.error(error);
              return void context.serverResponse.sendInternalServerErrorHTMLResponse(
                <Unrecoverable />
              );
            }

            if (userOAuthCredentialDocument === null) {
              logger.debug('OAuth2 credential document not found for existing user, creating a new credential document', { email: googleUserProfile.email });
              try {
                await googleInsertUserOAuthCredentials(userProfileDocument.uuid);
              }
              catch (error) {
                logger.error(error);
                return void context.serverResponse.sendInternalServerErrorHTMLResponse(
                  <Unrecoverable />
                );
              }
            }
          }

          break;
        default:
          logger.debug('OAuth2 callback received for unsupported provider', { provider });
          return context.serverResponse.sendBadRequestHTMLResponse(
            <Unrecoverable />
          )
      }

      // initialise authentication token cookies
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

      return context.serverResponse.sendSeeOtherRedirect(
        context.incomingMessage.loginState.cookie.payload?.returnUrl || new URL('/', `https://${readConfig('service.*.host')}`)
      )
    }

    // Abandon the flow if required fields are missing
    if (('attempt' in decryptedState) === false) {
      logger.debug('Missing attempt count in decrypted OAuth2 state in callback');
      return context.serverResponse.sendBadRequestHTMLResponse(
        <Unrecoverable />
      )
    }

    // Validate attempt count type
    if (typeof decryptedState.attempt !== 'number') {
      logger.debug('Invalid attempt count in decrypted OAuth2 state in callback');
      return context.serverResponse.sendBadRequestHTMLResponse(
        <Unrecoverable />
      )
    }
    let attempt: number = decryptedState.attempt;

    // Handle retryable errors
    if (attempt >= 3) {
      logger.debug(`OAuth2 authentication attempt ${attempt} failed for provider ${provider}, exceeding retry limit`);
      return context.serverResponse.sendBadRequestHTMLResponse(
        <OAuthCallback error="retry_limit_exceeded" provider={provider} />
      );
    }

    // Increment attempt count
    attempt += 1;

    // Re-encrypt state with updated attempt count
    const updatedEncryptedState = encrypt(
      JSON.stringify({
        ...decryptedState,
        attempt,
      }),
      readSecret('encrypter.secret-key')
    );

    switch (`${provider}__${error}`) {
      case 'google__interaction_required':
        const authorisationURL = googleAuthorisationURL({
          clientId: readConfig('oauth2.google.client-id'),
          prompt: 'consent login',
          redirectUrl: new URL('/oauth2/google/callback', `https://${readConfig('service.*.host')}`),
          state: updatedEncryptedState,
        })
        return void context.serverResponse.sendSeeOtherRedirect(authorisationURL);
      default:
        logger.debug('OAuth2 callback returned error that is not handled:', { provider, error });
        return context.serverResponse.sendBadRequestHTMLResponse(
          <OAuthCallback error={error} provider={provider} />
        )
    }
  }
])
