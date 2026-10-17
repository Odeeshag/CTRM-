describe('Login Page Test Suite', () => {


  beforeEach(() => {
    cy.visit('https://ctrm.lalcotrading.com/')
  })


  it('Verify login page elements', () => {

    cy.get('input').eq(0)
      .should('be.visible')

    cy.get('input[type="password"]')
      .should('be.visible')

    cy.get('button.primary')
      .should('be.visible')

  })


  it('Login with valid credentials', () => {

    cy.get('input').eq(0)
      .type('odeesha')

    cy.get('input[type="password"]')
      .type('odeesha')

    cy.get('button.primary')
      .click()

    cy.url()
      .should('include', '/dashboard')

  })


  it('Login with invalid username', () => {

    cy.get('input').eq(0)
      .type('wronguser')

    cy.get('input[type="password"]')
      .type('odeesha')

    cy.get('button.primary')
      .click()

    cy.contains('invalid username or password')
      .should('be.visible')

  })


  it('Login with invalid password', () => {

    cy.get('input').eq(0)
      .type('odeesha')

    cy.get('input[type="password"]')
      .type('wrongpassword')

    cy.get('button.primary')
      .click()

    cy.contains('invalid username or password')
      .should('be.visible')

  })


  it('Login without entering username', () => {

    cy.get('input[type="password"]')
      .type('odeesha')

    cy.get('button.primary')
      .click()

    cy.contains('invalid username or password')
      .should('be.visible')

  })


  it('Login without entering password', () => {

    cy.get('input').eq(0)
      .type('odeesha')

    cy.get('button.primary')
      .click()

    cy.contains('invalid username or password')
      .should('be.visible')

  })


  it('Login with empty fields', () => {

    cy.get('button.primary')
      .click()

    cy.contains('invalid username or password')
      .should('be.visible')

  })


  it('Verify password is masked', () => {

    cy.get('input[type="password"]')
      .should('have.attr', 'type', 'password')

  })

  it('Login with valid credentials and navigate to Dashboard', () => {

  // Enter valid username
  cy.get('input').eq(0)
    .type('odeesha')

  // Enter valid password
  cy.get('input[type="password"]')
    .type('odeesha')

  // Click Sign In button
  cy.get('button.primary')
    .should('be.visible')
    .click()

  // Verify user is redirected to Dashboard
  cy.url()
    .should('include', '/dashboard')

})


})