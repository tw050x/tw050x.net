# Authentication Cookies

> TODO: This document is out of date and needs updating.

This document outlines the cookies used by the authentication system.

## Cookies

The following cookies are in use:

* The `auth.is.authenticated` cookie
* The `auth.token.access` cookie
* The `auth.token.identity` cookie
* The `auth.token.refresh` cookie

### The `auth.is.authenticated` cookie

This cookie is used to determine if the user is authenticated. It is a boolean value and is synchronised with the `auth.token.refresh` cookie. You can use this cookie to determine if a user <u>should</u> be sent to the `/login` page or the `/token/refresh` endpoint.

#### The `/login` page

This page is for users to login to the system by providing their email and password. If the user is not authenticated, they <u>should</u> be redirected to this page.

#### The `/token/refresh` endpoint

This endpoint is used to refresh the identity token. If the user is authenticated, they <u>should</u> be redirected to this endpoint.

### The `auth.token.access` cookie

This cookie stores the user's access token which used to <u>authorise</u> the users requests to all servers. The access token <u>should</u> contain the user's email address and the user's roles (and anoy other relevant information).

### The `auth.token.identity` cookie

This cookie stores the user's identity token which is used to <u>authenticate</u> the user. It can be used to generate an access token on the `/token/authorise` endpoint.

### The `auth.token.refresh` cookie

This cookie stores the user's refresh token which is used to refresh the identity token. The refresh token <u>should</u> be stored securely and should not be shared with anyone.
