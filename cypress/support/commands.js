// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('login', () => {

    cy.session('login', () => {

        cy.visit('https://ctrm.lalcotrading.com/')

        cy.get('input')
            .eq(0)
            .type('odeesha')

        cy.get('input[type="password"]')
            .type('odeesha')

        cy.get('button.primary')
            .should('be.visible')
            .click()

        // Verify login is successful
        cy.url()
            .should('include', '/dashboard')
    })

    // After restoring the session, make sure we are on dashboard
    cy.visit('https://ctrm.lalcotrading.com/dashboard')

    cy.url()
        .should('include', '/dashboard')
})