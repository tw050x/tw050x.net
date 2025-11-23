import { default as navigationPortalGet } from "./route/navigation/portal/get.js";
import { default as navigationPortalOptions } from "./route/navigation/portal/options.js";


// Define and export the routes
export default {

  // navigation portal
  'GET /navigation/portal': navigationPortalGet,
  'OPTIONS /navigation/portal': navigationPortalOptions,
}
