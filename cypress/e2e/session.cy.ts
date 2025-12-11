describe('As a user when I am logged in, I want my session to refresh with activity', () => {
  it('should redirect to the login page when there is no active session',  () => {
    cy.visit('/portal/dashboard');
    cy.url().should('eq', `${Cypress.config().baseUrl}/login`);
  });

  it('should refresh session every time there is activity from me', () => {
    const timestamp = Date.now();
    const email = `test.user.${timestamp}@example.com`;
    const password = 'Password123!';
    cy.task<{ id: string }>('createUserAndSession', { email, password }).then((session) => {
      cy.setCookie('user.session', session.id, {
        domain: 'tw050x.dev',
        httpOnly: false,
        expiry: Math.floor(Date.now() / 1000) + 3600,
        path: '/',
        sameSite: 'lax',
        secure: true,
      });
    });

    cy.intercept('GET', '/portal/dashboard').as('dashboardPageLoad');
    cy.visit('/portal/dashboard');

    let expiryOneMatch;
    cy.wait('@dashboardPageLoad').then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      expect(interception.response?.headers).to.have.property('set-cookie');
      const setCookieHeader = interception.response?.headers['set-cookie'];
      const sessionCookie = Array.isArray(setCookieHeader)
        ? setCookieHeader.find((cookie) => cookie.startsWith('user.session='))
        : setCookieHeader?.startsWith('user.session=')
          ? setCookieHeader
          : undefined;

      expect(sessionCookie).to.exist;
      expiryOneMatch = sessionCookie?.match(/expires=([^;]+)/);
      expect(expiryOneMatch).to.exist;
    });

    cy.wait(2000); // wait for 2 seconds to ensure a different expiry time

    cy.intercept('GET', '/portal/settings').as('settingsPageLoad');
    cy.visit('/portal/settings');

    let expiryTwoMatch;
    cy.wait('@settingsPageLoad').
      then((interception) => {
        expect(interception.response?.statusCode).to.eq(200);
        expect(interception.response?.headers).to.have.property('set-cookie');
        const setCookieHeader = interception.response?.headers['set-cookie'];
        const sessionCookie = Array.isArray(setCookieHeader)
          ? setCookieHeader.find((cookie) => cookie.startsWith('user.session='))
          : setCookieHeader?.startsWith('user.session=')
            ? setCookieHeader
            : undefined;

        expect(sessionCookie).to.exist;
        expiryTwoMatch = sessionCookie?.match(/expires=([^;]+)/);
        expect(expiryTwoMatch).to.exist;
      }).
      then(() => {
        expect(expiryOneMatch[0]).to.not.eq(expiryTwoMatch[0]);
      });
  });

  it('should end the session after expiry time has been reached', () => {
    const timestamp = Date.now();
    const email = `test.user.${timestamp}@example.com`;
    const password = 'Password123!';
    const sessionOverrides = {
      timeoutAt: new Date(Date.now() + (60 * 1000)), // session expires in 1 minute
    };
    cy.task<{ id: string }>('createUserAndSession', { email, password, sessionOverrides }).then((session) => {
      cy.setCookie('user.session', session.id, {
        domain: 'tw050x.dev',
        httpOnly: false,
        expiry: Math.floor(Date.now() / 1000) + 3600,
        path: '/',
        sameSite: 'lax',
        secure: true,
      });
    });

    cy.intercept('GET', '/portal/dashboard').as('dashboardPageLoad');
    cy.visit('/portal/dashboard');

    cy.wait('@dashboardPageLoad').then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
    });

    cy.wait(120_000); // wait for 2 minutes to ensure background job (which runs every minute) have run to expire the session

    cy.visit('/portal/dashboard');
    cy.url().should('eq', `${Cypress.config().baseUrl}/login`);
  });
});
