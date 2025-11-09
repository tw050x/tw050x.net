
/**
 * Parameters required to build the Facebook OAuth2 authorisation URL.
 */
type AuthorisationURLParameters = {
  clientId: string;
  redirectUrl: string;
  state: string;
};

/**
 * Constructs the Facebook OAuth2 authorisation URL.
 *
 * @param params - The parameters required to build the authorisation URL.
 * @returns The complete Facebook OAuth2 authorisation URL.
 */
const authorisationURL = ({ clientId, redirectUrl, state }: AuthorisationURLParameters) => {
  const url = new URL('/v12.0/dialog/oauth', 'https://www.facebook.com');
  url.searchParams.append('client_id', clientId);
  url.searchParams.append('redirect_uri', redirectUrl);
  url.searchParams.append('state', state);
  return url.toString();
}
export default authorisationURL;
