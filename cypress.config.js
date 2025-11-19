import { defineConfig } from 'cypress'

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
