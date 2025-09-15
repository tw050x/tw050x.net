describe('As a user i want to register an account', () => {
  it('should allow a user to enter their details, register an account and be redirected to the home page', () => {
    const timestamp = Date.now();
    const email = `test.user.${timestamp}@example.com`;
    const password = 'Password123!';
    cy.visit('/register');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="password-confirmation"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
  });

  it('should show validation errors if the form is submitted with no data', () => {
    cy.visit('/register');
    cy.get('button[type="submit"]').click();
    cy.get('.errors').should('be.visible');
  });

  it('should show validation errors if the form is submitted with email but no password fields', () => {
    const email = 'test.user@example.com';
    cy.visit('/register');
    cy.get('input[name="email"]').type(email);
    cy.get('button[type="submit"]').click();
    cy.get('.errors').should('be.visible');
  });

  it('should show validation errors if the form is submitted with no email but both password fields', () => {
    const password = 'password';
    cy.visit('/register');
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="password-confirmation"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.get('.errors').should('be.visible');
  });

  it('should show validation errors if the form is submitted with invalid email', () => {
    const email = 'invalid-email';
    const password = 'password';
    cy.visit('/register');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="password-confirmation"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.get('.errors').should('be.visible');
    cy.get('input[name="email"]').should('have.value', email);
  });

  it('should show validation errors if the form is submitted with password fields that do not match', () => {
    const email = 'test.user@example.com';
    const password = 'short';
    const passwordConfirmation = 'long';
    cy.visit('/register');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="password-confirmation"]').type(passwordConfirmation);
    cy.get('button[type="submit"]').click();
    cy.get('.errors').should('be.visible');
  });

  it('should navigate to the login page when the login link is clicked', () => {
    cy.visit('/register');
    cy.get('a[href="/login"]').click();
    cy.url().should('eq', `${Cypress.config().baseUrl}/login`);
  });
});
