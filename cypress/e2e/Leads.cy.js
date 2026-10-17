/// <reference types="cypress" />

// ===========================================================
// Helpers for the New Lead popup
// (the page behind the popup also has Company / Contact / Currency
//  labels, so every popup field is scoped inside the popup)
// ===========================================================
const getModal = () =>
    cy.contains('button', 'Create Lead')
        .parents('[role="dialog"], .modal, div[class*="modal"]')
        .last()

const getField = (label, control = 'input, select') =>
    getModal()
        .contains('label', new RegExp(`^${label}`, 'i'))
        .parent()
        .find(control)
        .first()

const titleInput = () => getField('Title', 'input')
const companySelect = () => getField('Company', 'select')
const contactSelect = () => getField('Contact', 'select')
const commoditySelect = () => getField('Commodity', 'select')
const valueInput = () => getField('Estimated Value', 'input')
const currencySelect = () => getField('Currency', 'select')
const probabilityInput = () => getField('Probability', 'input')
const closeDateInput = () => getField('Expected Close', 'input')

const createBtn = () => getModal().contains('button', 'Create Lead')
const cancelBtn = () => getModal().contains('button', 'Cancel')
const closeIcon = () => getModal().find('button').first() // "X" in the popup header

// Select the first real option (skips the "— select —" placeholder)
const selectFirstOption = (getSelect) => {
    getSelect()
        .find('option')
        .not(':first')
        .first()
        .invoke('val')
        .then((val) => getSelect().select(val))
}

const futureDate = (days = 30) => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    return d.toISOString().split('T')[0]
}

const fillTitle = (title = `Auto Lead ${Date.now()}`) => {
    titleInput().clear().type(title)
    return title
}
const fillCompany = () => selectFirstOption(companySelect)
const fillContact = () => {
    contactSelect().should('not.be.disabled')
    selectFirstOption(contactSelect)
}
const fillCommodity = () => selectFirstOption(commoditySelect)

const fillMandatoryFields = (title) => {
    const t = fillTitle(title)
    fillCompany()
    fillContact()
    fillCommodity()
    return t
}

const openNewLeadPopup = () => {
    cy.contains('button', '+ New Lead')
        .should('be.visible')
        .click()

    cy.contains('button', 'Create Lead')
        .should('be.visible')
}

const expectNoSubmit = () => {
    cy.get('@createLead.all').should('have.length', 0)
    cy.contains('button', 'Create Lead').should('be.visible')
}


describe('Leads Module', () => {

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
        // Open Leads
        // ==========================
        cy.contains('a', 'Leads')
            .should('be.visible')
            .click()

        // ==========================
        // Verify Leads Page
        // ==========================
        cy.url()
            .should('include', '/leads')

        cy.contains('Leads')
            .should('be.visible')
    })


    // ===========================================================
    // Test Case 1 - Login and Navigate to Leads Page
    // ===========================================================
    it('Login and Navigate to Leads Page', () => {

        cy.contains('Leads')
            .should('be.visible')

        cy.contains('+ New Lead')
            .should('be.visible')

    })


    // ===========================================================
    // Test Case 2 - Verify Leads Page
    // ===========================================================
    it('Verify Leads Page is displayed', () => {

        cy.contains('Leads')
            .should('be.visible')

        cy.contains('+ New Lead')
            .should('be.visible')

    })


    // ===========================================================
    // Test Case 3 - Verify Search Field
    // ===========================================================
    it('Verify Search field is displayed', () => {

        cy.get('input[placeholder="lead title"]')
            .should('be.visible')
            .and('exist')

    })


    // // ===========================================================
    // // Test Case 4 - Verify Company Filter
    // // ===========================================================
    // it('Verify Company dropdown contains company list', () => {

    //     // Click Company dropdown
    //     cy.contains('label', 'Company')
    //         .parent('.field')
    //         .find('select')
    //         .select('Acme Refining Ltd')

    //     // Verify selected company
    //     cy.contains('label', 'Company')
    //         .parent('.field')
    //         .find('select')
    //         .should('have.value', '6d999830-9aac-49c1-bb73-1d47cf188480')

    //     // Verify Leads table contains Acme Refining Ltd
    //     cy.get('table tbody tr')
    //         .each(($row) => {
    //             cy.wrap($row)
    //                 .find('td')
    //                 .eq(1)
    //                 .should('contain', 'Acme Refining Ltd')
    //     })

    //     cy.contains('label', 'Contact')
    //         .parent('.field')
    //         .find('select')
    //         .select('test hello')

    //     // Verify selected Contact
    //     cy.contains('label', 'Contact')
    //         .parent('.field')
    //         .find('select')
    //         .should('have.value', 'e979cb34-bece-4598-a17d-0a6e8ea21c77')

    //     // Verify Leads table contains test hello
    //     cy.get('table tbody tr')
    //         .each(($row) => {
    //             cy.wrap($row)
    //                 .find('td')
    //                 .eq(2)
    //                 .should('contain', 'test hello')
    //     })

    // })


    // ===========================================================
    // Test Case 5 - Verify Currency Filter
    // ===========================================================
    it('Verify Currency dropdown contains currency list', () => {

        // Click Currency dropdown
        cy.contains('label', 'Currency')
            .parent()
            .find('select')
            .as('currencyDropdown')

        // Verify options are available
        cy.contains('label', 'Currency')
            .parent()
            .find('option')
            .should('have.length.greaterThan', 1)

    })


    // ===========================================================
    // Test Case 6 - Verify Clear Button
    // ===========================================================
    it('Verify Clear button is displayed', () => {

        cy.contains('button', 'Clear')
            .should('be.visible')
            .and('exist')

    })


    // ===========================================================
    // Test Case 7 - Verify Company Name Redirect
    // ===========================================================
    it('Verify clicking company name redirects to Company Details page', () => {

        // Wait for the Leads table to load
        cy.get('table tbody tr').should('have.length.greaterThan', 0)

        // Find the index of the "Company" column from the table header
        cy.contains('table thead th', 'Company')
            .invoke('index')
            .then((colIndex) => {

                // Get the Company cell in the first row
                cy.get('table tbody tr')
                    .first()
                    .find('td')
                    .eq(colIndex)
                    .as('companyCell')

                // Store the company name before clicking
                cy.get('@companyCell')
                    .invoke('text')
                    .then((text) => {
                        const companyName = text.trim()

                        // Click the company name
                        cy.get('@companyCell')
                            .should('be.visible')
                            .find('a, span, div')
                            .first()
                            .click({ force: true })

                        // Verify navigation to Company Details page
                        cy.url().should('include', '/counterparties/')

                        // Verify the correct company opened
                        cy.contains(companyName).should('be.visible')
                    })
            })

    })


    // ===========================================================
    // NEW LEAD FORM
    // (outer beforeEach logs in and opens Leads page,
    //  inner beforeEach opens the New Lead popup)
    // ===========================================================
    describe('New Lead Form', () => {

        beforeEach(() => {

            cy.intercept('POST', '**/leads*').as('createLead')

            openNewLeadPopup()
        })


        // =======================================================
        // OPEN / CLOSE
        // =======================================================

        // ===========================================================
        // Test Case 8 - Verify New Lead Popup opens
        // ===========================================================
        it('Verify clicking New Lead opens New Lead popup', () => {

            getModal().should('be.visible')

        })

        // ===========================================================
        // Test Case 9 - Verify popup header
        // ===========================================================
        it('Verify popup header shows New Lead', () => {

            getModal()
                .contains(/^New Lead$/)
                .should('be.visible')

        })

        // ===========================================================
        // Test Case 10 - Close popup using X icon
        // ===========================================================
        it('Verify popup closes using X icon', () => {

            closeIcon().click()

            cy.contains('button', 'Create Lead')
                .should('not.exist')

        })

        // ===========================================================
        // Test Case 11 - Close popup using Cancel button
        // ===========================================================
        it('Verify popup closes using Cancel button', () => {

            cancelBtn().click()

            cy.contains('button', 'Create Lead')
                .should('not.exist')

        })

        // // ===========================================================
        // // Test Case 12 - Close popup using Escape key
        // // ===========================================================
        // it('Verify popup closes using Escape key', () => {

        //     cy.get('body').type('{esc}')

        //     cy.contains('button', 'Create Lead')
        //         .should('not.exist')

        // })

        // ===========================================================
        // Test Case 13 - Cancel does not send create request
        // ===========================================================
        it('Verify Cancel does not send a create request', () => {

            titleInput().type('Should not be saved')

            cancelBtn().click()

            cy.get('@createLead.all').should('have.length', 0)

        })

        // ===========================================================
        // Test Case 14 - Cancelled lead not in table
        // ===========================================================
        it('Verify cancelled lead does not appear in Leads table', () => {

            titleInput().type('Should not be saved')

            cancelBtn().click()

            cy.contains('Should not be saved')
                .should('not.exist')

        })

        // ===========================================================
        // Test Case 15 - Click inside popup keeps it open
        // ===========================================================
        it('Verify popup stays open when clicking inside the form', () => {

            getModal().click()

            getModal().should('be.visible')

        })

        // ===========================================================
        // Test Case 16 - Title cleared on reopen
        // ===========================================================
        it('Verify Title is cleared when popup is reopened', () => {

            titleInput().type('Temp title')

            cancelBtn().click()

            openNewLeadPopup()

            titleInput().should('have.value', '')

        })

        // ===========================================================
        // Test Case 17 - Company reset on reopen
        // ===========================================================
        it('Verify Company is reset when popup is reopened', () => {

            fillCompany()

            cancelBtn().click()

            openNewLeadPopup()

            companySelect().should('have.value', '')

        })

        // ===========================================================
        // Test Case 18 - Contact disabled on reopen
        // ===========================================================
        it('Verify Contact is disabled again when popup is reopened', () => {

            fillCompany()

            cancelBtn().click()

            openNewLeadPopup()

            contactSelect().should('be.disabled')

        })


        // =======================================================
        // UI ELEMENTS
        // =======================================================

        // ===========================================================
        // Test Case 19 - Title label
        // ===========================================================
        it('Verify Title label is displayed', () => {

            getModal().contains('label', /^Title/i).should('be.visible')

        })

        // ===========================================================
        // Test Case 20 - Company label
        // ===========================================================
        it('Verify Company label is displayed', () => {

            getModal().contains('label', /^Company/i).should('be.visible')

        })

        // ===========================================================
        // Test Case 21 - Contact label
        // ===========================================================
        it('Verify Contact label is displayed', () => {

            getModal().contains('label', /^Contact/i).should('be.visible')

        })

        // ===========================================================
        // Test Case 22 - Commodity label
        // ===========================================================
        it('Verify Commodity label is displayed', () => {

            getModal().contains('label', /^Commodity/i).should('be.visible')

        })

        // ===========================================================
        // Test Case 23 - Estimated Value label
        // ===========================================================
        it('Verify Estimated Value label is displayed', () => {

            getModal().contains('label', /^Estimated Value/i).should('be.visible')

        })

        // ===========================================================
        // Test Case 24 - Currency label
        // ===========================================================
        it('Verify Currency label is displayed', () => {

            getModal().contains('label', /^Currency/i).should('be.visible')

        })

        // ===========================================================
        // Test Case 25 - Probability label
        // ===========================================================
        it('Verify Probability label is displayed', () => {

            getModal().contains('label', /^Probability/i).should('be.visible')

        })

        // ===========================================================
        // Test Case 26 - Expected Close label
        // ===========================================================
        it('Verify Expected Close label is displayed', () => {

            getModal().contains('label', /^Expected Close/i).should('be.visible')

        })

        // ===========================================================
        // Test Case 27 - Title marked required
        // ===========================================================
        it('Verify Title is marked as required', () => {

            getModal().contains('label', /^Title.*\*/i).should('exist')

        })

        // ===========================================================
        // Test Case 28 - Company marked required
        // ===========================================================
        it('Verify Company is marked as required', () => {

            getModal().contains('label', /^Company.*\*/i).should('exist')

        })

        // ===========================================================
        // Test Case 29 - Contact marked required
        // ===========================================================
        it('Verify Contact is marked as required', () => {

            getModal().contains('label', /^Contact.*\*/i).should('exist')

        })

        // ===========================================================
        // Test Case 30 - Commodity marked required
        // ===========================================================
        it('Verify Commodity is marked as required', () => {

            getModal().contains('label', /^Commodity.*\*/i).should('exist')

        })

        // ===========================================================
        // Test Case 31 - Estimated Value not required
        // ===========================================================
        it('Verify Estimated Value is not marked as required', () => {

            getModal()
                .contains('label', /^Estimated Value/i)
                .invoke('text')
                .should('not.contain', '*')

        })

        // ===========================================================
        // Test Case 32 - Currency not required
        // ===========================================================
        it('Verify Currency is not marked as required', () => {

            getModal()
                .contains('label', /^Currency/i)
                .invoke('text')
                .should('not.contain', '*')

        })

        // ===========================================================
        // Test Case 33 - Probability not required
        // ===========================================================
        it('Verify Probability is not marked as required', () => {

            getModal()
                .contains('label', /^Probability/i)
                .invoke('text')
                .should('not.contain', '*')

        })

        // ===========================================================
        // Test Case 34 - Expected Close labelled optional
        // ===========================================================
        it('Verify Expected Close is labelled as optional', () => {

            getModal()
                .contains('label', /^Expected Close/i)
                .invoke('text')
                .should('match', /optional/i)

        })

        // ===========================================================
        // Test Case 35 - Title placeholder
        // ===========================================================
        it('Verify Title placeholder is displayed', () => {

            titleInput()
                .should('have.attr', 'placeholder')
                .and('match', /Q3 copper requirement/i)

        })

        // ===========================================================
        // Test Case 36 - Estimated Value placeholder
        // ===========================================================
        it('Verify Estimated Value placeholder is displayed', () => {

            valueInput()
                .should('have.attr', 'placeholder')
                .and('match', /1000 increments/i)

        })

        // ===========================================================
        // Test Case 37 - Helper note
        // ===========================================================
        it('Verify required fields helper note is displayed', () => {

            getModal()
                .contains(/Company, Contact and Commodity are required/i)
                .should('be.visible')

        })

        // ===========================================================
        // Test Case 38 - Cancel button visible
        // ===========================================================
        it('Verify Cancel button is displayed', () => {

            cancelBtn().should('be.visible')

        })

        // ===========================================================
        // Test Case 39 - Cancel button enabled
        // ===========================================================
        it('Verify Cancel button is enabled', () => {

            cancelBtn().should('not.be.disabled')

        })

        // ===========================================================
        // Test Case 40 - Create Lead button visible
        // ===========================================================
        it('Verify Create Lead button is displayed', () => {

            createBtn().should('be.visible')

        })

        // ===========================================================
        // Test Case 41 - Create Lead button enabled
        // ===========================================================
        it('Verify Create Lead button is enabled', () => {

            createBtn().should('not.be.disabled')

        })

        // ===========================================================
        // Test Case 42 - Title focused
        // ===========================================================
        it('Verify Title field is focused when popup opens', () => {

            titleInput().should('have.focus')

        })


        // =======================================================
        // DEFAULT VALUES
        // =======================================================

        // ===========================================================
        // Test Case 43 - Title default
        // ===========================================================
        it('Verify Title is empty by default', () => {

            titleInput().should('have.value', '')

        })

        // ===========================================================
        // Test Case 44 - Company default
        // ===========================================================
        it('Verify Company is not selected by default', () => {

            companySelect().should('have.value', '')

        })

        // ===========================================================
        // Test Case 45 - Commodity default
        // ===========================================================
        it('Verify Commodity is not selected by default', () => {

            commoditySelect().should('have.value', '')

        })

        // ===========================================================
        // Test Case 46 - Estimated Value default
        // ===========================================================
        it('Verify Estimated Value is empty by default', () => {

            valueInput().should('have.value', '')

        })

        // ===========================================================
        // Test Case 47 - Currency default
        // ===========================================================
        it('Verify Currency defaults to USD', () => {

            currencySelect()
                .find('option:selected')
                .should('contain.text', 'USD')

        })

        // ===========================================================
        // Test Case 48 - Probability default
        // ===========================================================
        it('Verify Probability defaults to 10', () => {

            probabilityInput().should('have.value', '10')

        })

        // ===========================================================
        // Test Case 49 - Expected Close default
        // ===========================================================
        it('Verify Expected Close is empty by default', () => {

            closeDateInput().should('have.value', '')

        })


        // =======================================================
        // REQUIRED FIELD VALIDATION
        // =======================================================

        // ===========================================================
        // Test Case 50 - Empty form
        // ===========================================================
        it('Verify empty form is not submitted', () => {

            createBtn().click()

            expectNoSubmit()

        })

        // ===========================================================
        // Test Case 51 - Only Title
        // ===========================================================
        it('Verify form with only Title is not submitted', () => {

            fillTitle()

            createBtn().click()

            expectNoSubmit()

        })

        // ===========================================================
        // Test Case 52 - Without Title
        // ===========================================================
        it('Verify form without Title is not submitted', () => {

            fillCompany()
            fillContact()
            fillCommodity()

            createBtn().click()

            expectNoSubmit()

        })

        // ===========================================================
        // Test Case 53 - Without Company
        // ===========================================================
        it('Verify form without Company is not submitted', () => {

            fillTitle()
            fillCommodity()

            createBtn().click()

            expectNoSubmit()

        })

        // ===========================================================
        // Test Case 54 - Without Contact
        // ===========================================================
        it('Verify form without Contact is not submitted', () => {

            fillTitle()
            fillCompany()
            fillCommodity()

            createBtn().click()

            expectNoSubmit()

        })

        // ===========================================================
        // Test Case 55 - Without Commodity
        // ===========================================================
        it('Verify form without Commodity is not submitted', () => {

            fillTitle()
            fillCompany()
            fillContact()

            createBtn().click()

            expectNoSubmit()

        })

        // ===========================================================
        // Test Case 56 - Title with only spaces
        // ===========================================================
        it('Verify Title with only spaces is not accepted', () => {

            titleInput().type('     ')
            fillCompany()
            fillContact()
            fillCommodity()

            createBtn().click()

            expectNoSubmit()

        })

        // ===========================================================
        // Test Case 57 - Validation message
        // ===========================================================
        it('Verify validation message is shown for empty required fields', () => {

            createBtn().click()

            // Native HTML5 validation OR custom error text
            titleInput().then(($el) => {
                if ($el[0].validationMessage) {
                    expect($el[0].validationMessage).to.not.be.empty
                } else {
                    getModal().contains(/required|please/i).should('be.visible')
                }
            })

        })


        // =======================================================
        // COMPANY -> CONTACT DEPENDENCY
        // =======================================================

        // ===========================================================
        // Test Case 58 - Contact disabled before company
        // ===========================================================
        it('Verify Contact is disabled before a company is selected', () => {

            contactSelect().should('be.disabled')

        })

        // ===========================================================
        // Test Case 59 - Contact placeholder text
        // ===========================================================
        it('Verify Contact shows "select Company first" before company is selected', () => {

            contactSelect()
                .find('option:selected')
                .should('contain.text', 'select Company first')

        })

        // ===========================================================
        // Test Case 60 - Company list
        // ===========================================================
        it('Verify Company dropdown contains company list', () => {

            companySelect()
                .find('option')
                .should('have.length.greaterThan', 1)

        })

        // ===========================================================
        // Test Case 61 - Contact enabled after company
        // ===========================================================
        it('Verify Contact is enabled after a company is selected', () => {

            fillCompany()

            contactSelect().should('not.be.disabled')

        })

        // ===========================================================
        // Test Case 62 - Contact list loads
        // ===========================================================
        it('Verify Contact lists contacts of the selected company', () => {

            fillCompany()

            contactSelect()
                .find('option')
                .should('have.length.greaterThan', 1)

        })

        // ===========================================================
        // Test Case 63 - Contact list changes with company
        // ===========================================================
        it('Verify Contact list changes when a different company is selected', () => {

            const getContactOptions = () =>
                contactSelect()
                    .find('option')
                    .then(($o) => [...$o].map((o) => o.text))

            companySelect()
                .find('option')
                .not(':first')
                .then(($opts) => {

                    if ($opts.length < 2) {
                        cy.log('Only one company available - skipping')
                        return
                    }

                    companySelect().select($opts.eq(0).val())

                    getContactOptions().then((first) => {

                        companySelect().select($opts.eq(1).val())

                        getContactOptions().then((second) => {
                            expect(second).to.not.deep.equal(first)
                        })
                    })
                })

        })

        // ===========================================================
        // Test Case 64 - Contact reset when company changes
        // ===========================================================
        it('Verify Contact selection is reset when company changes', () => {

            companySelect()
                .find('option')
                .not(':first')
                .then(($opts) => {

                    if ($opts.length < 2) {
                        cy.log('Only one company available - skipping')
                        return
                    }

                    companySelect().select($opts.eq(0).val())

                    fillContact()

                    contactSelect().should('not.have.value', '')

                    companySelect().select($opts.eq(1).val())

                    contactSelect().should('have.value', '')
                })

        })

        // ===========================================================
        // Test Case 65 - Contact disabled when company cleared
        // ===========================================================
        it('Verify Contact is disabled again when Company is reset', () => {

            fillCompany()

            companySelect().select('')

            contactSelect().should('be.disabled')

        })

        // ===========================================================
        // Test Case 66 - Contact has no value without company
        // ===========================================================
        it('Verify Contact cannot be selected without a company', () => {

            contactSelect()
                .should('be.disabled')
                .and('have.value', '')

        })


        // =======================================================
        // TITLE FIELD
        // =======================================================

        // ===========================================================
        // Test Case 67 - Title alphanumeric
        // ===========================================================
        it('Verify Title accepts alphanumeric text', () => {

            titleInput()
                .type('Copper 500MT Q3')
                .should('have.value', 'Copper 500MT Q3')

        })

        // ===========================================================
        // Test Case 68 - Title special characters
        // ===========================================================
        it('Verify Title accepts special characters', () => {

            titleInput()
                .type('Lead #1 - A&B (50%) / test')
                .should('have.value', 'Lead #1 - A&B (50%) / test')

        })

        // ===========================================================
        // Test Case 69 - Title long text
        // ===========================================================
        it('Verify Title handles very long text', () => {

            titleInput()
                .type('A'.repeat(300), { delay: 0 })
                .invoke('val')
                .then((value) => {
                    expect(value.length).to.be.at.most(300)
                })

        })

        // ===========================================================
        // Test Case 70 - Title script input
        // ===========================================================
        it('Verify Title stores script input as plain text', () => {

            titleInput()
                .type('<script>alert(1)</script>', { parseSpecialCharSequences: false })
                .should('have.value', '<script>alert(1)</script>')

        })

        // ===========================================================
        // Test Case 71 - Title can be cleared
        // ===========================================================
        it('Verify Title can be cleared', () => {

            titleInput()
                .type('Something')
                .clear()
                .should('have.value', '')

        })


        // =======================================================
        // COMMODITY FIELD
        // =======================================================

        // ===========================================================
        // Test Case 72 - Commodity list
        // ===========================================================
        it('Verify Commodity dropdown contains commodity list', () => {

            commoditySelect()
                .find('option')
                .should('have.length.greaterThan', 1)

        })

        // ===========================================================
        // Test Case 73 - Select commodity
        // ===========================================================
        it('Verify a commodity can be selected', () => {

            fillCommodity()

            commoditySelect().should('not.have.value', '')

        })


        // =======================================================
        // ESTIMATED VALUE FIELD
        // =======================================================

        // ===========================================================
        // Test Case 74 - Whole number
        // ===========================================================
        it('Verify Estimated Value accepts a whole number', () => {

            valueInput()
                .type('5000')
                .should('have.value', '5000')

        })

        // ===========================================================
        // Test Case 75 - Decimal number
        // ===========================================================
        it('Verify Estimated Value accepts a decimal number', () => {

            valueInput()
                .type('1500.50')
                .should('have.value', '1500.50')

        })

        // ===========================================================
        // Test Case 76 - Alphabets
        // ===========================================================
        it('Verify Estimated Value does not accept alphabetic characters', () => {

            valueInput()
                .type('abc')
                .should('have.value', '')

        })

        // ===========================================================
        // Test Case 77 - Negative value
        // ===========================================================
        it('Verify negative Estimated Value is rejected', () => {

            fillMandatoryFields()

            valueInput().type('-100')

            createBtn().click()

            expectNoSubmit()

        })

        // ===========================================================
        // Test Case 78 - Step attribute
        // ===========================================================
        it('Verify Estimated Value has step attribute', () => {

            valueInput().should('have.attr', 'step')

        })

        // ===========================================================
        // Test Case 79 - Optional
        // ===========================================================
        // it('Verify lead is created without Estimated Value', () => {

        //     fillMandatoryFields()

        //     createBtn().click()

        //     cy.wait('@createLead')
        //         .its('response.statusCode')
        //         .should('be.oneOf', [200, 201])

        // })


        // =======================================================
        // CURRENCY FIELD
        // =======================================================

        // ===========================================================
        // Test Case 80 - Currency list
        // ===========================================================
        it('Verify Currency dropdown contains currency list in popup', () => {

            currencySelect()
                .find('option')
                .should('have.length.greaterThan', 1)

        })

        // ===========================================================
        // Test Case 81 - Change currency
        // ===========================================================
        it('Verify Currency can be changed', () => {

            currencySelect()
                .find('option')
                .not(':selected')
                .first()
                .invoke('val')
                .then((val) => {
                    currencySelect()
                        .select(val)
                        .should('have.value', val)
                })

        })

        // ===========================================================
        // Test Case 82 - USD available
        // ===========================================================
        it('Verify USD is available in the Currency list', () => {

            currencySelect()
                .find('option')
                .then(($o) => {
                    const texts = [...$o].map((o) => o.text).join(' ')
                    expect(texts).to.contain('USD')
                })

        })


        // =======================================================
        // PROBABILITY FIELD
        // =======================================================

        // ===========================================================
        // Test Case 83 - Valid value
        // ===========================================================
        it('Verify Probability accepts a valid value', () => {

            probabilityInput()
                .clear()
                .type('75')
                .should('have.value', '75')

        })

        // ===========================================================
        // Test Case 84 - Lower boundary
        // ===========================================================
        it('Verify Probability accepts lower boundary value 0', () => {

            probabilityInput()
                .clear()
                .type('0')
                .should('have.value', '0')

        })

        // ===========================================================
        // Test Case 85 - Upper boundary
        // ===========================================================
        it('Verify Probability accepts upper boundary value 100', () => {

            probabilityInput()
                .clear()
                .type('100')
                .should('have.value', '100')

        })

        // ===========================================================
        // Test Case 86 - Above 100
        // ===========================================================
        it('Verify Probability above 100 is rejected', () => {

            fillMandatoryFields()

            probabilityInput().clear().type('101')

            createBtn().click()

            expectNoSubmit()

        })

        // ===========================================================
        // Test Case 87 - Negative
        // ===========================================================
        it('Verify negative Probability is rejected', () => {

            fillMandatoryFields()

            probabilityInput().clear().type('-5')

            createBtn().click()

            expectNoSubmit()

        })

        // ===========================================================
        // Test Case 88 - Alphabets
        // ===========================================================
        it('Verify Probability does not accept alphabetic characters', () => {

            probabilityInput()
                .clear()
                .type('abc')
                .should('have.value', '')

        })


        // =======================================================
        // EXPECTED CLOSE DATE FIELD
        // =======================================================

        // ===========================================================
        // Test Case 89 - Future date
        // ===========================================================
        it('Verify Expected Close accepts a valid future date', () => {

            const date = futureDate(30)

            closeDateInput()
                .type(date)
                .should('have.value', date)

        })

        // ===========================================================
        // Test Case 90 - Optional
        // ===========================================================
        it('Verify lead is created without Expected Close date', () => {

            fillMandatoryFields()

            createBtn().click()

            cy.wait('@createLead')
                .its('response.statusCode')
                .should('be.oneOf', [200, 201])

        })

        // ===========================================================
        // Test Case 91 - Past date
        // ===========================================================
        it('Verify Expected Close with a past date as per business rule', () => {

            // Change this assertion if past dates must be blocked
            closeDateInput()
                .type('2020-01-01')
                .should('have.value', '2020-01-01')

        })


        // =======================================================
        // CREATE LEAD - MANDATORY FIELDS ONLY
        // =======================================================

        // ===========================================================
        // Test Case 92 - API success
        // ===========================================================
        it('Verify lead creation API returns success with mandatory fields', () => {

            fillMandatoryFields('Mandatory Only Lead')

            createBtn().click()

            cy.wait('@createLead')
                .its('response.statusCode')
                .should('be.oneOf', [200, 201])

        })

        // ===========================================================
        // Test Case 93 - Popup closes
        // ===========================================================
        it('Verify popup closes after lead is created', () => {

            fillMandatoryFields('Mandatory Only Lead')

            createBtn().click()

            cy.wait('@createLead')

            cy.contains('button', 'Create Lead')
                .should('not.exist')

        })

        // ===========================================================
        // Test Case 94 - Lead in table
        // ===========================================================
        it('Verify new lead appears in the Leads table', () => {

            const title = `Mandatory ${Date.now()}`

            fillMandatoryFields(title)

            createBtn().click()

            cy.wait('@createLead')

            cy.contains(title).should('be.visible')

        })

        // ===========================================================
        // Test Case 95 - Success message
        // ===========================================================
        it('Verify success message is displayed after lead creation', () => {

            fillMandatoryFields()

            createBtn().click()

            cy.contains(/created|success/i).should('be.visible')

        })

        // ===========================================================
        // Test Case 96 - Default probability in table
        // ===========================================================
        it('Verify new lead shows default 10% probability in table', () => {

            const title = `Prob ${Date.now()}`

            fillMandatoryFields(title)

            createBtn().click()

            cy.contains('table tbody tr', title)
                .should('contain.text', '10%')

        })


        // =======================================================
        // CREATE LEAD - ALL FIELDS
        // =======================================================

        const fillAllFields = (title) => {
            fillMandatoryFields(title)
            valueInput().type('10000')
            probabilityInput().clear().type('50')
            closeDateInput().type(futureDate(45))
        }

        // ===========================================================
        // Test Case 97 - API success
        // ===========================================================
        it('Verify lead creation API returns success with all fields', () => {

            fillAllFields(`Full ${Date.now()}`)

            createBtn().click()

            cy.wait('@createLead')
                .its('response.statusCode')
                .should('be.oneOf', [200, 201])

        })

        // ===========================================================
        // Test Case 98 - Payload title
        // ===========================================================
        it('Verify request payload contains the entered title', () => {

            const title = `Full ${Date.now()}`

            fillAllFields(title)

            createBtn().click()

            cy.wait('@createLead')
                .its('request.body')
                .then((body) => {
                    expect(JSON.stringify(body)).to.contain(title)
                })

        })

        // ===========================================================
        // Test Case 99 - Payload probability
        // ===========================================================
        it('Verify request payload contains the entered probability', () => {

            fillAllFields(`Full ${Date.now()}`)

            createBtn().click()

            cy.wait('@createLead')
                .its('request.body')
                .then((body) => {
                    expect(JSON.stringify(body)).to.contain('50')
                })

        })

        // ===========================================================
        // Test Case 100 - Popup closes
        // ===========================================================
        it('Verify popup closes after lead is created with all fields', () => {

            fillAllFields(`Full ${Date.now()}`)

            createBtn().click()

            cy.wait('@createLead')

            cy.contains('button', 'Create Lead')
                .should('not.exist')

        })

        // ===========================================================
        // Test Case 101 - Lead in table
        // ===========================================================
        it('Verify lead created with all fields appears in Leads table', () => {

            const title = `Full ${Date.now()}`

            fillAllFields(title)

            createBtn().click()

            cy.wait('@createLead')

            cy.contains(title).should('be.visible')

        })


        // =======================================================
        // LEADS COUNT AND DUPLICATES
        // =======================================================

        // ===========================================================
        // Test Case 102 - Leads count
        // ===========================================================
        it('Verify Leads count increases by one after creation', () => {

            cancelBtn().click()

            cy.contains(/Leads \((\d+)\)/)
                .invoke('text')
                .then((before) => {

                    const beforeCount = parseInt(before.match(/\((\d+)\)/)[1])

                    openNewLeadPopup()

                    fillMandatoryFields()

                    createBtn().click()

                    cy.wait('@createLead')

                    cy.contains(/Leads \((\d+)\)/)
                        .invoke('text')
                        .should((after) => {
                            expect(parseInt(after.match(/\((\d+)\)/)[1]))
                                .to.eq(beforeCount + 1)
                        })
                })

        })

        // ===========================================================
        // Test Case 103 - Duplicate title
        // ===========================================================
        it('Verify duplicate Title is handled as per business rule', () => {

            const title = `Duplicate ${Date.now()}`

            fillMandatoryFields(title)

            createBtn().click()

            cy.wait('@createLead')

            openNewLeadPopup()

            fillMandatoryFields(title)

            createBtn().click()

            cy.wait('@createLead')
                .its('response.statusCode')
                .should('be.oneOf', [200, 201, 400, 409])

        })


        // =======================================================
        // ERROR HANDLING AND EDGE CASES
        // =======================================================

        // ===========================================================
        // Test Case 104 - API failure keeps popup open
        // ===========================================================
        it('Verify popup stays open when API fails', () => {

            cy.intercept('POST', '**/leads*', {
                statusCode: 500,
                body: { message: 'Server error' }
            }).as('createLead')

            fillMandatoryFields()

            createBtn().click()

            cy.wait('@createLead')

            getModal().should('be.visible')

        })

        // ===========================================================
        // Test Case 105 - API failure shows error
        // ===========================================================
        it('Verify error message is displayed when API fails', () => {

            cy.intercept('POST', '**/leads*', {
                statusCode: 500,
                body: { message: 'Server error' }
            }).as('createLead')

            fillMandatoryFields()

            createBtn().click()

            cy.wait('@createLead')

            cy.contains(/error|failed|something went wrong/i)
                .should('be.visible')

        })

        // ===========================================================
        // Test Case 106 - Data kept after failure
        // ===========================================================
        it('Verify entered data is kept after API failure', () => {

            cy.intercept('POST', '**/leads*', { statusCode: 500 }).as('createLead')

            fillMandatoryFields('Keep My Data')

            createBtn().click()

            cy.wait('@createLead')

            titleInput().should('have.value', 'Keep My Data')

        })

        // ===========================================================
        // Test Case 107 - Double click
        // ===========================================================
        it('Verify double click sends only one create request', () => {

            cy.intercept('POST', '**/leads*', (req) => {
                req.reply({ delay: 800, statusCode: 201, body: {} })
            }).as('createLead')

            fillMandatoryFields()

            createBtn().dblclick()

            cy.wait('@createLead')

            cy.get('@createLead.all').should('have.length', 1)

        })

        // ===========================================================
        // Test Case 108 - Enter key valid form
        // ===========================================================
        it('Verify Enter key submits a valid form', () => {

            fillMandatoryFields()

            titleInput().type('{enter}')

            cy.wait('@createLead')
                .its('response.statusCode')
                .should('be.oneOf', [200, 201])

        })

        // ===========================================================
        // Test Case 109 - Enter key invalid form
        // ===========================================================
        it('Verify Enter key does not submit an invalid form', () => {

            titleInput().type('Only title{enter}')

            expectNoSubmit()

        })

    })

})