import { default as loginGet } from "./route/login/get.js";
import { default as loginOptions } from "./route/login/options.js";
import { default as loginPost } from "./route/login/post.js";
import { default as loginAsideLoginWithOAuthAsideGet } from "./route/login/aside/login-with-oauth-aside/get.js";
import { default as loginAsideLoginWithOAuthAsideOptions } from "./route/login/aside/login-with-oauth-aside/options.js";
import { default as loginAsideLoginWithPasswordAsideGet } from "./route/login/aside/login-with-password-aside/get.js";
import { default as loginAsideLoginWithPasswordAsideOptions } from "./route/login/aside/login-with-password-aside/options.js";
import { default as logoutOptions } from "./route/logout/options.js";
import { default as logoutPost } from "./route/logout/post.js";
import { default as oauth2ProviderGet } from "./route/oauth2/:provider/get.js";
import { default as oauth2ProviderOptions } from "./route/oauth2/:provider/options.js";
import { default as oauth2ProviderCallbackGet } from "./route/oauth2/:provider/callback/get.js";
import { default as oauth2ProviderCallbackOptions } from "./route/oauth2/:provider/callback/options.js";
import { default as registerGet } from "./route/register/get.js";
import { default as registerOptions } from "./route/register/options.js";
import { default as registerPost } from "./route/register/post.js";
import { default as registerAsideRegisterAsideGet } from "./route/register/aside/register-aside/get.js";
import { default as registerAsideRegisterAsideOptions } from "./route/register/aside/register-aside/options.js";
import { default as tokenRefreshOptions } from "./route/token/refresh/options.js";
import { default as tokenRefreshPost } from "./route/token/refresh/post.js";
import { default as tokenRefreshAvailabilityOptions } from "./route/token/refresh/availability/options.js";
import { default as tokenRefreshAvailabilityPost } from "./route/token/refresh/availability/post.js";

// Define and export the routes
export default {

  // login
  'GET /login': loginGet,
  'OPTIONS /login': loginOptions,
  'POST /login': loginPost,

  // login aside login-with-oauth-aside
  'GET /login/aside/login-with-oauth-aside': loginAsideLoginWithOAuthAsideGet,
  'OPTIONS /login/aside/login-with-oauth-aside': loginAsideLoginWithOAuthAsideOptions,

  // login aside login-with-password-aside
  'GET /login/aside/login-with-password-aside': loginAsideLoginWithPasswordAsideGet,
  'OPTIONS /login/aside/login-with-password-aside': loginAsideLoginWithPasswordAsideOptions,

  // logout
  'OPTIONS /logout': logoutOptions,
  'POST /logout': logoutPost,

  // oauth2 provider
  'GET /oauth2/:provider': oauth2ProviderGet,
  'OPTIONS /oauth2/:provider': oauth2ProviderOptions,

  // oauth2 :provider callback
  'GET /oauth2/:provider/callback': oauth2ProviderCallbackGet,
  'OPTIONS /oauth2/:provider/callback': oauth2ProviderCallbackOptions,

  // register
  'GET /register': registerGet,
  'OPTIONS /register': registerOptions,
  'POST /register': registerPost,

  // register aside register-aside
  'GET /register/aside/register-aside': registerAsideRegisterAsideGet,
  'OPTIONS /register/aside/register-aside': registerAsideRegisterAsideOptions,

  // token refresh
  'OPTIONS /token/refresh': tokenRefreshOptions,
  'POST /token/refresh': tokenRefreshPost,

  // token refresh availability
  'OPTIONS /token/refresh/availability': tokenRefreshAvailabilityOptions,
  'POST /token/refresh/availability': tokenRefreshAvailabilityPost,
}
