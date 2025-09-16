import { resolve } from "node:path";
import { defineConfig } from 'cypress'
import { default as dotenv } from "dotenv";

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, './.env.authentication') });
dotenv.config({ path: resolve(__dirname, './.env.error') });
dotenv.config({ path: resolve(__dirname, './.env.marketing') });
dotenv.config({ path: resolve(__dirname, './.env.navigation') });
dotenv.config({ path: resolve(__dirname, './.env.portal') });
dotenv.config({ path: resolve(__dirname, './.env.user') });

//
export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        async createUser({ email, password }) {
          const { createUser } = require('./cypress/support/user');
          return await createUser(email, password);
        },
        async createEncryptedLoginCookieValue(content) {
          const { createEncryptedLoginCookieValue } = require('./cypress/support/cookie');
          return await createEncryptedLoginCookieValue(JSON.stringify(content));
        }
      })
    },
    baseUrl: 'https://tw050x.dev',
  },
});
