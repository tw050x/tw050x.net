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

  it('should allow a user to enter their email and password and be redirected to the page determined by login state cookie', () => {
    const timestamp = Date.now();
    const email = `test.user.${timestamp}@example.com`;
    const password = 'Password123!';
    cy.task('createUser', { email, password });
    const loginStateCookieContent = {
      returnUrl: `${Cypress.config().baseUrl}/portal/dashboard`
    }
    cy.task<string>('createEncryptedLoginCookieValue', loginStateCookieContent).then((loginStateCookieValue) => {
      cy.setCookie('login.state', loginStateCookieValue, {
        domain: 'tw050x.dev',
        path: '/',
        secure: true,
        httpOnly: false,
      });
    });
    cy.visit('/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', `${Cypress.config().baseUrl}/portal/dashboard`);
  });

  it('should show validation errors if the form is submitted with no data', () => {
    cy.visit('/login');
    cy.get('button[type="submit"]').click();
    cy.get('[data-component="notice"][data-component-type="error"]').should('be.visible');
  });

  it('should show validation errors if the form is submitted with only email the field', () => {
    const email = 'test.user@example.com';
    cy.visit('/login');
    cy.get('input[name="email"]').type(email);
    cy.get('button[type="submit"]').click();
    cy.get('[data-component="notice"][data-component-type="error"]').should('be.visible');
  });

  it('should show validation errors if the form is submitted with only the password field', () => {
    const password = 'password';
    cy.visit('/login');
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.get('[data-component="notice"][data-component-type="error"]').should('be.visible');
  });

  it('should show validation errors if the form is submitted with invalid email', () => {
    const email = 'invalid-email';
    const password = 'password';
    cy.visit('/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.get('[data-component="notice"][data-component-type="error"]').should('be.visible');
    cy.get('input[name="email"]').should('have.value', email);
  });

  it('should navigate to the register page when the register link is clicked', () => {
    cy.visit('/login');
    cy.get('a[href="/register"]').click();
    cy.url().should('eq', `${Cypress.config().baseUrl}/register`);
  });
});
