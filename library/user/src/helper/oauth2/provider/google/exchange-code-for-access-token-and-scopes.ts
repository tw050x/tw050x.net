import { read as readConfig } from "@tw050x.net.library/configs";
import { logger } from "@tw050x.net.library/logger";
import { read as readSecret } from "@tw050x.net.library/secrets";

/**
 * Exchange an OAuth2 authorization code for an access token from Google.
 * @param code The authorization code received from Google.
 * @returns The access token.
 */
const exchangeCodeForTokenAndScopes = async (code: string): Promise<{ accessToken: string; scope: null | string  }> => {
  const url = new URL('/token', 'https://oauth2.googleapis.com');

  // fetch the access token
  let response;
  try {
    response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code,
        client_id: readConfig('oauth2.google.client-id'),
        client_secret: readSecret('oauth2.google.client-secret'),
        grant_type: 'authorization_code',
        redirect_uri: readConfig('oauth2.google.redirect-uri'),
      })
    });
  }
  catch (error) {
    logger.debug('Failed to exchange OAuth2 code for token');
    logger.error(error);
    throw new Error('failed_to_exchange_oauth2_code_for_token');
  }

  if (response.ok === false) {
    logger.debug('OAuth2 token exchange response not OK', { status: response.status });
    throw new Error('failed_to_exchange_oauth2_code_for_token');
  }

  let responseData;
  try {
    responseData = await response.json() as unknown;
  }
  catch (error) {
    logger.debug('Failed to parse OAuth2 token exchange response as JSON');
    logger.error(error);
    throw new Error('failed_to_exchange_oauth2_code_for_token');
  }

  if (responseData === null) {
    logger.debug('OAuth2 token exchange response JSON is not an object');
    throw new Error('failed_to_exchange_oauth2_code_for_token');
  }

  if (typeof responseData !== 'object') {
    logger.debug('OAuth2 token exchange response JSON is not an object');
    throw new Error('failed_to_exchange_oauth2_code_for_token');
  }

  if (('access_token' in responseData) === false) {
    logger.debug('OAuth2 token exchange response missing access_token');
    throw new Error('failed_to_exchange_oauth2_code_for_token');
  }

  if (('scope' in responseData) === false) {
    logger.debug('OAuth2 token exchange response missing scope');
    throw new Error('failed_to_exchange_oauth2_code_for_token');
  }

  if (typeof responseData.access_token !== 'string') {
    logger.debug('OAuth2 token exchange response access_token is not a string');
    throw new Error('failed_to_exchange_oauth2_code_for_token');
  }

  return {
    accessToken: responseData.access_token,
    scope: typeof responseData.scope === 'string' ? responseData.scope : null,
  };
};
export default exchangeCodeForTokenAndScopes;
