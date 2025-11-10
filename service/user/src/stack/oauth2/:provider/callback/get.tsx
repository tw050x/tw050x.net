import { client as userDatabaseClient, database as userDatabase } from "@tw050x.net.database/user";
import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/authentication/middleware/use-access-token-cookie";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/authentication/middleware/use-login-state-cookie";
import { UseRefreshTokenCookieOptions, useRefreshTokenCookie } from "@tw050x.net.library/authentication/middleware/use-refresh-token-cookie";
import { sanitizeMongoDBFilterOrPipeline } from "@tw050x.net.library/database";
import { logger } from "@tw050x.net.library/logger";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { decrypt, encrypt } from "@tw050x.net.library/encryption";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { sendMessage } from "@tw050x.net.library/queue";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as Unrecoverable } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { normaliseEmailAddress } from "@tw050x.net.library/utility/normalise-email-address";
import { randomUUID } from "node:crypto"
import { default as jwt, SignOptions } from "jsonwebtoken";
import { default as googleAuthorisationURL } from '../../../../helper/oauth2/provider/google/authorisation-url.js';
import { default as googleOAuth2ExchangeCodeForAccessTokenAndScope } from '../../../../helper/oauth2/provider/google/exchange-code-for-access-token-and-scopes.js';
import { default as googleFetchUserProfile } from '../../../../helper/oauth2/provider/google/fetch-user-profile.js';
import { default as googleInsertUserOAuthCredentials } from '../../../../helper/oauth2/provider/google/insert-user-oauth-credentials.js';
import { useLoginEnabledGate } from "../../../../middleware/use-login-enabled-gate.js";
import { useRefreshTokenGate } from "../../../../middleware/use-refresh-token-gate.js";
import { default as OAuthCallback } from "../../../../template/document/OAuthCallback.js";
import { serviceParameters } from "../../../../parameters.js";
import { serviceSecrets } from "../../../../secrets.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'POST', 'OPTIONS'],
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
  useLoginEnabledGate(),
  useAccessTokenCookie(useAccessTokenCookieOptions),
  useLoginStateCookie(useLoginStateCookieOptions),
  useRefreshTokenCookie(useRefreshTokenCookieOptions),

  // check if the user has a valid access token
  // async (context) => {
  // TODO: implement access token check
  // },

  useRefreshTokenGate(),

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
      decryptedState = decrypt(state, serviceSecrets.getSecret('encrypter.secret-key'));
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
            userProfileDocument = await userDatabase.profile.findOne(
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
                userProfileDocumentByUuid = await userDatabase.profile.findOne({
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
            let userDatabaseSession = userDatabaseClient.startSession();
            let userProfileId;
            userDatabaseSession.startTransaction();
            try {
              const profile = await userDatabase.profile.insertOne({
                createdAt: new Date(),
                updatedAt: new Date(),
                email: googleUserProfile.email,
                emailNormalised: normalisedGoogleUserProfileEmailAddress,
                uuid: userProfileUuid,
              });
              await googleInsertUserOAuthCredentials(profile.insertedId);
              await userDatabaseSession.commitTransaction();
              userProfileId = profile.insertedId;
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
              const eventQueueUrl = serviceParameters.getParameter('user.service.event-queue-url');
              await sendMessage(
                new URL(eventQueueUrl),
                { eventType: 'UserRegistered', userProfileId, userProfileUuid },
                { MessageType: { DataType: 'String', StringValue: 'UserRegistered' } }
              );
            }
            catch (error) {
              // We can survive a failure to send the message, so just log it
              logger.error(error);
            }

            try {
              userProfileDocument = await userDatabase.profile.findOne({
                _id: userProfileId
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
                  userProfileId: userProfileDocument._id,
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
                await googleInsertUserOAuthCredentials(userProfileDocument._id);
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

      // read the JWT secret key
      // return an error if there is a problem
      const jwtSecretKey = serviceSecrets.getSecret('jwt.secret-key');
      if (jwtSecretKey === undefined) {
        logger.error('JWT secret key is undefined');
        return void context.serverResponse.sendInternalServerErrorHTMLResponse(
          <Unrecoverable />
        );
      }

      // generate JWT tokens and set cookies
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
      context.serverResponse.refreshTokenCookie.set(refreshToken);
      context.serverResponse.accessTokenCookie.set(accessToken);
      context.serverResponse.loginStateCookie.clear();

      return context.serverResponse.sendSeeOtherRedirect(
        new URL('/', `https://${serviceParameters.getParameter('user.service.host')}`)
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
      serviceSecrets.getSecret('encrypter.secret-key')
    );

    switch (`${provider}__${error}`) {
      case 'google__interaction_required':
        const authorisationURL = googleAuthorisationURL({
          clientId: serviceParameters.getParameter('oauth2.provider.google.client-id'),
          prompt: 'consent login',
          redirectUrl: new URL('/oauth2/google/callback', `https://${serviceParameters.getParameter('user.service.host')}`),
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
