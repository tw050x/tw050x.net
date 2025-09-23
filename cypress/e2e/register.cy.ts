describe('As a user I want to register an account', () => {
  it('should allow a user to enter their details, register an account and be redirected to the welcome page', () => {
    const timestamp = Date.now();
    const email = `test.user.${timestamp}@example.com`;
    const password = 'Password123!';
    cy.visit('/register');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="password-confirmation"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', `${Cypress.config().baseUrl}/portal/welcome`);
  });

  it('should allow a user to enter their details, register an account and be redirected to the welcome page, ignoring the login state cookie', () => {
    const timestamp = Date.now();
    const email = `test.user.${timestamp}@example.com`;
    const password = 'Password123!';
    const loginStateCookieContent = {
      returnUrl: `${Cypress.config().baseUrl}/portal/dashboard`
    }
    cy.task<string>('createEncryptedLoginCookieValue', loginStateCookieContent).then((loginStateCookieValue) => {
      cy.setCookie('login.state', loginStateCookieValue, {
        domain: 'tw050x.dev',
        path: '/',
        secure: true,
        httpOnly: true,
      });
    });
    cy.visit('/register');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="password-confirmation"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', `${Cypress.config().baseUrl}/portal/welcome`);
  });

  it('should show validation errors if the form is submitted with no data', () => {
    cy.visit('/register');
    cy.get('button[type="submit"]').click();
    cy.get('[data-component="notice"][data-component-type="error"]').should('be.visible');
  });

  it('should show validation errors if the form is submitted with only the email field', () => {
    const email = 'test.user@example.com';
    cy.visit('/register');
    cy.get('input[name="email"]').type(email);
    cy.get('button[type="submit"]').click();
    cy.get('[data-component="notice"][data-component-type="error"]').should('be.visible');
  });

  it('should show validation errors if the form is submitted with only the password fields', () => {
    const password = 'password';
    cy.visit('/register');
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="password-confirmation"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.get('[data-component="notice"][data-component-type="error"]').should('be.visible');
  });

  it('should show validation errors if the form is submitted with invalid email', () => {
    const email = 'invalid-email';
    const password = 'password';
    cy.visit('/register');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="password-confirmation"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.get('[data-component="notice"][data-component-type="error"]').should('be.visible');
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
    cy.get('[data-component="notice"][data-component-type="error"]').should('be.visible');
  });

  it('should navigate to the login page when the login link is clicked', () => {
    cy.visit('/register');
    cy.get('a[href="/login"]').click();
    cy.url().should('eq', `${Cypress.config().baseUrl}/login`);
  });
});
