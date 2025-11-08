
/**
 * Parameters required to build the Google OAuth2 authorisation URL.
 */
type AuthorisationURLParameters = {
  accessType?: 'offline' | 'online';
  clientId: string;
  prompt?: 'consent' | 'none';
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
  const { scope = 'email openid connect' } = parameters;
  const { state } = parameters;

  const url = new URL('/o/oauth2/v2/auth', 'https://accounts.google.com');
  url.searchParams.append('access_type', accessType);
  url.searchParams.append('client_id', clientId);
  url.searchParams.append('prompt', prompt);
  url.searchParams.append('redirect_uri', redirectUrl.toString());
  url.searchParams.append('response_type', responseType);
  url.searchParams.append('scope', scope);
  url.searchParams.append('state', state);
  return url.toString();

}
export default authorisationURL;
