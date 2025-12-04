describe('As a user I want to logout of my account', () => {
  it('should allow a logged in user to logout and be redirected to the home page', () => {
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
    cy.visit('/portal/dashboard');
    cy.url().should('eq', `${Cypress.config().baseUrl}/portal/dashboard`);
    cy.getCookie('user.session').should('exist');
    cy.get('a[hx-post="/logout"]').click();
    cy.url().should('eq', `${Cypress.config().baseUrl}/login`);
    cy.getCookie('user.session').should('not.exist');
  });
});
