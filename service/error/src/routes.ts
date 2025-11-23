import { default as notFoundGet } from "./route/404/get.js";
import { default as notFoundOptions } from "./route/404/options.js";

// Define and export the routes
export default {

  // not found
  'GET /404': notFoundGet,
  'OPTIONS /404': notFoundOptions,
}
