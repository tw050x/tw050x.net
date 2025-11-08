
/**
 * Parameters required to build the Google OAuth2 authorisation URL.
 */
type AuthorisationURLParameters = {
  accessType?: 'offline' | 'online';
  clientId: string;
  prompt?: 'consent' | 'consent login' | 'none';
  redirectUrl: URL;
  responseType?: 'code';
  scope?: string;
  state: string;
};

/**
 * Constructs the Google OAuth2 authorisation URL.
 *
 * @param params - The parameters required to build the authorisation URL.
 * @returns The complete Google OAuth2 authorisation URL.
 *
 * See: https://developers.google.com/identity/protocols/oauth2/web-server
 */
const authorisationURL = (parameters: AuthorisationURLParameters) => {
  const { accessType = 'online' } = parameters;
  const { clientId } = parameters;
  const { prompt = 'none' } = parameters;
  const { redirectUrl } = parameters;
  const { responseType = 'code' } = parameters;
  const { scope = 'email openid' } = parameters;
  const { state } = parameters;

  // initial url
  const url = new URL('/o/oauth2/v2/auth', 'https://accounts.google.com');

  // append query parameters
  url.searchParams.append('access_type', accessType);
  url.searchParams.append('client_id', clientId);
  url.searchParams.append('prompt', prompt);
  url.searchParams.append('redirect_uri', redirectUrl.toString());
  url.searchParams.append('response_type', responseType);
  url.searchParams.append('scope', scope);
  url.searchParams.append('state', state);

  // return the complete URL
  return url;
}
export default authorisationURL;
