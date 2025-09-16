describe('As a user I want to login to my account', () => {
  it('should allow a user to enter their email and password and be redirected to the home page', () => {
    const timestamp = Date.now();
    const email = `test.user.${timestamp}@example.com`;
    const password = 'Password123!';
    cy.task('createUser', { email, password });
    cy.visit('/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
  });
});
