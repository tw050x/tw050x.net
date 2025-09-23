import { resolve } from "node:path";
import { defineConfig } from 'cypress'
import { default as dotenv } from "dotenv";

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, './.env.aws') });
dotenv.config({ path: resolve(__dirname, './.env.database.authentication') });
dotenv.config({ path: resolve(__dirname, './.env.database.user') });
dotenv.config({ path: resolve(__dirname, './.env.logs') });
dotenv.config({ path: resolve(__dirname, './.env.mongo-client') });
dotenv.config({ path: resolve(__dirname, './.env.service.error') });
dotenv.config({ path: resolve(__dirname, './.env.service.authentication') });
dotenv.config({ path: resolve(__dirname, './.env.service.marketing') });
dotenv.config({ path: resolve(__dirname, './.env.service.navigation') });
dotenv.config({ path: resolve(__dirname, './.env.service.portal') });
dotenv.config({ path: resolve(__dirname, './.env.service.user') });

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
