# Cookies

This document outlines the cookies used by the system.

## Cookies

The following cookies are in use:

* The `auth.token.access` cookie
* The `auth.token.refresh` cookie
* The `auth.token.refreshable` cookie

### The `auth.token.refreshable` cookie

This cookie is used to determine if the user is authenticated. It is a boolean value and is synchronised with the `auth.token.refresh` cookie. You can use this cookie to determine if a user <u>should</u> be sent to the `/login` page or the `/token/refresh` endpoint.

#### The `/login` page

This page is for users to login to the system by providing their email and password. If the user is not authenticated, they <u>should</u> be redirected to this page.

#### The `/token/refresh` endpoint

This endpoint is used to refresh the identity token. If the user is authenticated, they <u>should</u> be redirected to this endpoint.

### The `auth.token.access` cookie

This cookie stores the user's access token which used to <u>authorise</u> the users requests to all servers. The access token <u>should</u> contain the user's email address and the user's roles (and anoy other relevant information).

#### Private Claims

There are no current private claims in the access token.

### The `auth.token.refresh` cookie

This cookie stores the user's refresh token which is used to refresh the identity token. The refresh token <u>should</u> be stored securely and should not be shared with anyone.

#### Private Claims

##### The `aex` Claim

`aex` is a private claim in the refresh token that indicates the absolute end time of the refresh token. This claim is used to determine when the refresh token expires and when the user needs to re-authenticate.

The `aex` claim is represented as a Unix timestamp (number of seconds since January 1, 1970). When the current time exceeds the value of the `aex` claim, the refresh token is considered expired, and the user must log in again to obtain a new refresh token.

When using refresh token rotation, a new refresh token is created and the `aex` claim is copied from the old refresh token to the new refresh token. This ensures that the absolute expiration time remains consistent across token rotations.

The new refresh tokens `exp` claim value should take into account the `aex` claim to ensure that the new refresh token does not exceed the absolute expiration time defined by the `aex` claim.
