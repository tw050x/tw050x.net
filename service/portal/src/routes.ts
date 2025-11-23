import { default as portalAccountGet } from './route/portal/account/get.js';
import { default as portalAccountOptions } from './route/portal/account/options.js';
import { default as portalAssignmentGet } from './route/portal/assignment/get.js';
import { default as portalAssignmentOptions } from './route/portal/assignment/options.js';
import { default as portalBrandsGet } from './route/portal/brands/get.js';
import { default as portalBrandsOptions } from './route/portal/brands/options.js';
import { default as portalDashboardGet } from './route/portal/dashboard/get.js';
import { default as portalDashboardOptions } from './route/portal/dashboard/options.js';
import { default as portalProductsGet } from './route/portal/products/get.js';
import { default as portalProductsOptions } from './route/portal/products/options.js';
import { default as portalSettingsGet } from './route/portal/settings/get.js';
import { default as portalSettingsOptions } from './route/portal/settings/options.js';
import { default as portalUsersGet } from './route/portal/users/get.js';
import { default as portalUsersOptions } from './route/portal/users/options.js';
import { default as portalUsersPartialUserTableToolsGet } from './route/portal/users/partial/user-table-tools/get.js';
import { default as portalUsersPartialUserTableToolsOptions } from './route/portal/users/partial/user-table-tools/options.js';
import { default as portalGet } from './route/portal/get.js';
import { default as portalOptions } from './route/portal/options.js';

// Define and export the routes
export default {

  // portal account
  'GET /portal/account': portalAccountGet,
  'OPTIONS /portal/account': portalAccountOptions,

  // portal assignment
  'GET /portal/assignment': portalAssignmentGet,
  'OPTIONS /portal/assignment': portalAssignmentOptions,

  // portal brands
  'GET /portal/brands': portalBrandsGet,
  'OPTIONS /portal/brands': portalBrandsOptions,

  // portal dashboard
  'GET /portal/dashboard': portalDashboardGet,
  'OPTIONS /portal/dashboard': portalDashboardOptions,

  // portal products
  'GET /portal/products': portalProductsGet,
  'OPTIONS /portal/products': portalProductsOptions,

  // portal settings
  'GET /portal/settings': portalSettingsGet,
  'OPTIONS /portal/settings': portalSettingsOptions,

  // portal users
  'GET /portal/users': portalUsersGet,
  'OPTIONS /portal/users': portalUsersOptions,

  // portal users partial user-table-tools
  'GET /portal/users/partial/user-table-tools': portalUsersPartialUserTableToolsGet,
  'OPTIONS /portal/users/partial/user-table-tools': portalUsersPartialUserTableToolsOptions,

  // portal
  'GET /portal': portalGet,
  'OPTIONS /portal': portalOptions,
}
