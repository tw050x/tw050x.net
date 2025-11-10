import { logger } from "@tw050x.net.library/logger";
import { serviceParameters } from "../../../../parameters.js";
import { serviceSecrets } from "../../../../secrets.js";

/**
 * Exchange an OAuth2 authorization code for an access token from Google.
 * @param code The authorization code received from Google.
 * @returns The access token.
 */
const exchangeCodeForToken = async (code: string): Promise<string> => {
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
        client_id: serviceParameters.getParameter('oauth2.provider.google.client-id'),
        client_secret: serviceSecrets.getSecret('oauth2.provider.google.client-secret'),
        grant_type: 'authorization_code',
        redirect_uri: serviceParameters.getParameter('oauth2.provider.google.redirect-uri'),
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

  if (typeof responseData.access_token !== 'string') {
    logger.debug('OAuth2 token exchange response access_token is not a string');
    throw new Error('failed_to_exchange_oauth2_code_for_token');
  }

  return responseData.access_token;
};
export default exchangeCodeForToken;
