import { default as authoriseGet } from "./route/authorise/get.js";
import { default as authoriseOptions } from "./route/authorise/options.js";

// Define and export the routes
export default {

  // authorise
  'GET /authorise': authoriseGet,
  'OPTIONS /authorise': authoriseOptions,
}
