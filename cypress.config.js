import { defineConfig } from 'cypress'

//
export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        async createUser({ email, password }) {
          const { createUser } = require('./cypress/support/users');
          return await createUser(email, password);
        },
        async createUserAndSession({ email, password, sessionOverrides }) {
          const { createUser } = require('./cypress/support/users');
          const { createSession } = require('./cypress/support/sessions');
          const { uuid } = await createUser(email, password);
          return await createSession(uuid, sessionOverrides);
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
