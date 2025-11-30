import { logger } from "@tw050x.net.library/logger";

/**
 * Fetches the user profile from Google using the provided access token.
 *
 * @param accessToken The access token to use for fetching the user profile.
 */
const fetchUserProfile = async (accessToken: string) => {
  const url = new URL('https://www.googleapis.com/oauth2/v2/userinfo');

  let response;
  try {
    response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  }
  catch (error) {
    logger.debug('Failed to fetch user profile from Google');
    logger.error(error);
    throw new Error('failed_to_fetch_oauth2_user_profile');
  }

  if (response.ok === false) {
    logger.debug('Google user profile response not OK', { status: response.status });
    throw new Error('failed_to_fetch_oauth2_user_profile');
  }

  let responseData;
  try {
    responseData = await response.json() as unknown;
  }
  catch (error) {
    logger.debug('Failed to parse Google user profile response as JSON');
    logger.error(error);
    throw new Error('failed_to_fetch_oauth2_user_profile');
  }

  if (responseData === null) {
    logger.debug('Google user profile response JSON is not an object');
    throw new Error('failed_to_fetch_oauth2_user_profile');
  }

  if (typeof responseData !== 'object') {
    logger.debug('Google user profile response JSON is not an object');
    throw new Error('failed_to_fetch_oauth2_user_profile');
  }

  return responseData;
}
export default fetchUserProfile;
