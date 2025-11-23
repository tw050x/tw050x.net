import { default as rootGet } from "./route/get.js";
import { default as rootOptions } from "./route/options.js";

// Define and export the routes
export default {

  // root
  'GET /': rootGet,
  'OPTIONS /': rootOptions,
}
