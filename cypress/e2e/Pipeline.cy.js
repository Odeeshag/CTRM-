/// <reference types="cypress" />

/**
 * Pipeline page – Filters test suite
 * URL: /deals
 *
 * NOTE: Selectors and API route below are ASSUMPTIONS. Update the SELECTORS
 * object (and DEALS_API) to match the real DOM / network calls.
 * Credentials come from Cypress env: CYPRESS_USERNAME / CYPRESS_PASSWORD.
 */

const DEALS_API = '**/api/**/deals*';

const SELECTORS = {
  // Filters
  searchInput: '[data-cy="filter-search"]',
  stageSelect: '[data-cy="filter-stage"]',
  currencySelect: '[data-cy="filter-currency"]',
  statusSelect: '[data-cy="filter-status"]',
  resetButton: '[data-cy="filter-reset"]',
  // Results
  dealRow: '[data-cy="deal-row"]',
  emptyState: '[data-cy="deals-empty"]',
  // Summary widgets
  currencyCards: '[data-cy="currency-card"]',
  totalsTableRows: '[data-cy="currency-totals-table"] tbody tr',
  stageTableRows: '[data-cy="stage-table"] tbody tr',
};

const STAGES = ['Qualified', 'Proposal', 'Negotiation'];
const CURRENCIES = ['EUR', 'GBP', 'JPY', 'SGD', 'USD'];

// ---------- helpers ----------
const typeSearch = (text) => {
  cy.get(SELECTORS.searchInput).clear();
  if (text) cy.get(SELECTORS.searchInput).type(text);
};

const selectFilter = (selector, value) => {
  cy.get(selector).select(value); // swap for custom dropdown click flow if not a native <select>
};

const parseMoney = (txt) => Number(txt.replace(/[^0-9.-]/g, ''));

describe('Pipeline Module', () => {

    beforeEach(() => {

        // Reuse existing login session
        cy.login()

        // ==========================
        // Open Clients Menu
        // ==========================
        cy.contains('button', 'Clients')
            .should('be.visible')
            .click()

        // ==========================
        // Open Pipeline
        // ==========================
        // Sidebar is scrollable - scroll Pipeline link into view first
        cy.contains('a', 'Pipeline')
            .scrollIntoView()
            .should('be.visible')
            .click()

        // ==========================
        // Verify Pipeline Page
        // ==========================
        cy.url()
            .should('include', '/deals')

        cy.contains('Pipeline')
            .should('be.visible')
    })


    // ===========================================================
    // Test Case 1 - Login and Navigate to Pipeline Page
    // ===========================================================
    it('Login and Navigate to Pipeline Page', () => {

        cy.contains('Pipeline')
            .should('be.visible')

        cy.contains('+ New deal')
            .should('be.visible')

    })


    // ===========================================================
    // Test Case 2 - Verify Pipeline Page
    // ===========================================================
    it('Verify Pipeline Page is displayed', () => {

        cy.contains('Pipeline')
            .should('be.visible')

        cy.contains('Qualified deals through to won/lost')
            .should('be.visible')

        cy.contains('+ New deal')
            .should('be.visible')

    })


    // ===========================================================
    // Test Case 3 - Verify Currency Summary Cards
    // ===========================================================
    it('Verify currency summary cards are displayed', () => {

        const currencies = ['EUR', 'GBP', 'JPY', 'SGD', 'USD']

        currencies.forEach((currency) => {
            cy.contains(currency)
                .should('be.visible')
        })

    })


    // ===========================================================
    // Test Case 4 - Verify Pipeline Totals by Currency Table
    // ===========================================================
    it('Verify Pipeline totals by currency table', () => {

        cy.contains('Pipeline totals by currency')
            .should('be.visible')

        const headers = [
            'CURRENCY',
            'TOTAL',
            'OPEN DEALS',
            'OPEN VALUE',
            'WEIGHTED VALUE',
            'WON VALUE',
            'LOST VALUE'
        ]

        headers.forEach((header) => {
    cy.contains('th, [role="columnheader"]', header, { matchCase: false })
        .should('be.visible') })

    })


    
    // Test Case 5 - Verify Pipeline by Stage Table
    // ===========================================================
    it('Verify Pipeline by stage table', () => {

        cy.contains('Pipeline by stage')
            .should('be.visible')

        const stages = ['Qualified', 'Proposal', 'Negotiation']

        stages.forEach((stage) => {
            cy.contains(stage)
                .should('be.visible')
        })

        const headers = ['DEALS', 'VALUE (USD)', 'WEIGHTED']

        headers.forEach((header) => {
            cy.contains('th, [role="columnheader"]', header, { matchCase: false })
                .should('be.visible')
        })

    })


    // ===========================================================
    // Test Case 6 - Verify Filters Section
    // ===========================================================
    it('Verify Filters section is displayed', () => {

        cy.contains('Filters')
            .scrollIntoView()
            .should('be.visible')

    })


    // ===========================================================
    // Test Case 7 - Open New Deal
    // ===========================================================
    it('Verify New deal button opens the create deal form', () => {

        cy.contains('button', '+ New deal')
            .should('be.visible')
            .click()

        // Verify modal is open
        cy.get('.modal-overlay')
            .should('be.visible')

        // Search only inside the modal, not the page behind it
        cy.get('.modal-overlay').within(() => {
            cy.contains(/new deal/i)
                .should('be.visible')
        })

    })

})


  
