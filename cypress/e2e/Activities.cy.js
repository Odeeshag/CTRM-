// cypress/e2e/activities.cy.js

describe('Activities Module', () => {

    // ==========================
    // Selectors (adjust here only)
    // ==========================
    const sel = {
        rows: 'tbody tr',
        modal: '[role="dialog"], .modal',
    }

    // ==========================
    // Helpers
    // ==========================
    const modal = () => cy.contains(/new activity|edit activity/i).closest(sel.modal)

    const field = (labelText) =>
        cy.contains('label', new RegExp(labelText, 'i'))

    const openNewActivityModal = () => {
        cy.contains('button', /new activity/i).click()
        cy.get('.modal-overlay').should('be.visible')
    }

    const uniqueSubject = (prefix = 'AUTO') => `${prefix}-${Date.now()}`

    const createActivity = ({ type = 'task', subject, notes = '' }) => {
        openNewActivityModal()
        field('^type').parent().find('select').select(type)
        field('^subject').parent().find('input').type(subject)
        if (notes) field('^notes').parent().find('textarea').type(notes)
        cy.contains('button', /^create$/i).click()
    }

    const searchFor = (text) => {
        field('^search').parent().find('input').clear().type(text)
    }

    const rowFor = (subject) => cy.contains(sel.rows, subject)

    // Removes an activity through the UI (cleanup)
    const deleteActivity = (subject) => {
        cy.on('window:confirm', () => true)
        searchFor(subject)
        rowFor(subject).find('button').last().click()
    }
    // Waits for the header count to settle (not 0) and returns it as a number
    const getSettledCount = () =>
        cy.contains(/Activities \(\d+\)/)
            .should(($h) => {
                expect($h.text()).not.to.eq('Activities (0)')
            })
            .then(($h) => Number($h.text().match(/\((\d+)\)/)[1]))
    
            

    // ==========================
    // Setup
    // ==========================
    beforeEach(() => {
    cy.viewport(1440, 1000)

    // Reuse existing login session (lands on the app, as in your original setup)
    cy.login()

    // Expand CLIENTS only if the Activities link is not in the DOM
    cy.get('body').then(($body) => {
        if (!$body.find('a.nav-link:contains("Activities")').length) {
            cy.contains('button', /clients/i).click()
        }
    })

    // Sidebar scrolls (overflow: auto), so scroll the link into view first
    cy.contains('a.nav-link', 'Activities')
        .scrollIntoView()
        .should('be.visible')
        .click()

    cy.url().should('include', '/activities')
    cy.contains('h1, h2', 'Activities').should('be.visible')
    })

    // ==========================================================
    // PAGE LOAD
    // ==========================================================
    context('Page load', () => {

        it('TC01 - should display page title and subtitle', () => {
            cy.contains('h1, h2', 'Activities').should('be.visible')
            cy.contains('Tasks, calls, meetings & reminders').should('be.visible')
        })

        it('TC02 - should display the New activity button', () => {
            cy.contains('button', /new activity/i).should('be.visible').and('be.enabled')
        })

        it('TC03 - should display Open, All and Completed tabs', () => {
            cy.contains('button', /^open$/i).should('be.visible')
            cy.contains('button', /^all$/i).should('be.visible')
            cy.contains('button', /^completed$/i).should('be.visible')
        })

        it('TC04 - should have Open tab selected by default', () => {
    // Active tab is styled differently from the inactive ones
    cy.contains('button', /^open$/i)
        .should('have.css', 'background-color')
        .then((openBg) => {
            cy.contains('button', /^all$/i)
                .should('have.css', 'background-color')
                .and('not.eq', openBg)

            cy.contains('button', /^completed$/i)
                .should('have.css', 'background-color')
                .and('not.eq', openBg)
        })
})

        it('TC05 - should display all filters', () => {
            cy.contains('Filters').should('be.visible')
            field('^search').should('be.visible')
            field('^type').should('be.visible')
            field('^owner').should('be.visible')
            field('^overdue').should('be.visible')
            cy.contains('button', /^clear$/i).should('be.visible')
        })

        it('TC06 - should display table column headers', () => {
            ;['Type', 'Subject', 'Linked to', 'Due', 'Logged', 'Owner', 'Actions'].forEach((h) => {
                cy.contains('th, [role="columnheader"]', new RegExp(`^${h}$`, 'i')).should('be.visible')
            })
        })

        it('TC07 - should display activities count in table header', () => {
            cy.contains(/Activities \(\d+\)/).should('be.visible')
        })

        it('TC08 - should show count that matches number of rows', () => {
            // Wait for data to finish loading
            cy.get(sel.rows).should('have.length.greaterThan', 0)

            // Retries until the header count and row count agree
            cy.contains(/Activities \(\d+\)/).should(($header) => {
                const count = Number($header.text().match(/\((\d+)\)/)[1])
                expect(Cypress.$(sel.rows).length).to.eq(count)
            })
        })

        it('TC09 - should show edit, complete and delete actions on every row', () => {
            // Wait for rows to finish rendering first
            cy.get(sel.rows).should('have.length.greaterThan', 0)

            cy.get(sel.rows).its('length').then((count) => {
                for (let i = 0; i < count; i++) {
                    // Re-query on every iteration so the subject is never stale
                    cy.get(sel.rows)
                        .eq(i)
                        .find('button, a, [role="button"]')
                        .should('have.length.at.least', 3)
                }
            })
        })
    })

    // // ==========================================================
    // // TABS
    // // ==========================================================
    // context('Status tabs', () => {

    //     it('TC10 - should show only open activities on Open tab', () => {
    //         cy.contains('button', /^open$/i).click()
    //         cy.get(sel.rows).should('exist')
    //     })

    //     it('TC11 - should show all activities on All tab', () => {
    //         const readCount = ($el) => Number($el.text().match(/\((\d+)\)/)[1])

    //         cy.contains('button', /^open$/i).click()

    //         // Wait for the Open list to finish loading before reading the count
    //         cy.get(sel.rows).should('have.length.greaterThan', 0)

    //         cy.contains(/Activities \(\d+\)/).then(($open) => {
    //             const openCount = readCount($open)

    //             cy.contains('button', /^all$/i).click()

    //             // Retries until the count settles and is >= the open count
    //             cy.contains(/Activities \(\d+\)/).should(($all) => {
    //                 expect(readCount($all)).to.be.gte(openCount)
    //             })
    //         })
    //     })

    //     it('TC12 - should show completed activities on Completed tab', () => {
    //         cy.contains('button', /^completed$/i).click()
    //         cy.contains(/Activities \(\d+\)/).should('be.visible')
    //     })

    //     it('TC13 - should switch back to Open tab from Completed', () => {
    //         cy.contains('button', /^completed$/i).click()
    //         cy.contains('button', /^open$/i).click()
    //         cy.contains(/Activities \(\d+\)/).should('be.visible')
    //     })
    // })

    // // ==========================================================
    // // FILTERS
    // // ==========================================================
    // context('Filters', () => {

    //     it('TC14 - should filter by subject using search', () => {
    //         cy.contains('button', /^all$/i).click()
    //         searchFor('review meeting')
    //         cy.get(sel.rows).should('have.length', 1)
    //         cy.get(sel.rows).first().should('contain', 'review meeting')
    //     })

    //     it('TC15 - should search by linked deal', () => {
    //         cy.contains('button', /^all$/i).click()
    //         searchFor('DEAL-000019')
    //         cy.get(sel.rows).should('have.length.at.least', 1)
    //         cy.get(sel.rows).each(($r) => expect($r.text()).to.contain('DEAL-000019'))
    //     })

    //     it('TC16 - should be case-insensitive when searching', () => {
    //         cy.contains('button', /^all$/i).click()
    //         searchFor('REVIEW MEETING')
    //         cy.get(sel.rows).should('contain', 'review meeting')
    //     })

    //     it('TC17 - should show no results for a search with no match', () => {
    //         searchFor('zzz-no-such-activity-999')

    //         // No data rows (task / call / meeting) should remain
    //         cy.contains(sel.rows, /task|call|meeting/i).should('not.exist')

    //         // Page still intact and the search value was applied
    //         field('^search').parent().find('input')
    //             .should('have.value', 'zzz-no-such-activity-999')
    //     })

    //     it('TC18 - should filter by type = task', () => {
    //         cy.contains('button', /^all$/i).click()
    //         field('^type').parent().find('select').select('task')
    //         cy.get(sel.rows).should('have.length.at.least', 1)
    //         cy.get(sel.rows).each(($r) => expect($r.text().toLowerCase()).to.contain('task'))
    //     })

    //     it('TC19 - should filter by type = call', () => {
    //         cy.contains('button', /^all$/i).click()
    //         field('^type').parent().find('select').select('call')
    //         cy.get(sel.rows).each(($r) => expect($r.text().toLowerCase()).to.contain('call'))
    //     })

    //     it('TC20 - should filter by type = meeting', () => {
    //         cy.contains('button', /^all$/i).click()
    //         field('^type').parent().find('select').select('meeting')
    //         cy.get(sel.rows).each(($r) => expect($r.text().toLowerCase()).to.contain('meeting'))
    //     })

    //     it('TC21 - should filter by owner', () => {
    //         cy.contains('button', /^all$/i).click()
    //         field('^owner').parent().find('select').select(1) // first real owner option
    //         cy.get(sel.rows).should('have.length.at.least', 1)
    //     })

    //     it('TC22 - should show only overdue activities when Overdue filter applied', () => {
    //         // NOTE: adjust option text to match your dropdown (e.g. "Overdue" / "Yes")
    //         field('^overdue').parent().find('select').select(1)
    //         cy.get(sel.rows).each(($r) => expect($r.text().toLowerCase()).to.contain('overdue'))
    //     })

    //     it('TC23 - should combine search and type filters', () => {
    //         cy.contains('button', /^all$/i).click()
    //         field('^type').parent().find('select').select('task')
    //         searchFor('test')
    //         cy.get(sel.rows).each(($r) => {
    //             const t = $r.text().toLowerCase()
    //             expect(t).to.contain('task')
    //             expect(t).to.contain('test')
    //         })
    //     })

    //     it('TC24 - should reset all filters when Clear is clicked', () => {
    //         cy.contains('button', /^all$/i).click()
    //         cy.get(sel.rows).should('have.length.greaterThan', 0)

    //         getSettledCount().then((before) => {
    //             searchFor('review meeting')
    //             field('^type').parent().find('select').select('meeting')

    //             cy.contains('button', /^clear$/i).click()

    //             field('^search').parent().find('input').should('have.value', '')
    //             field('^type').parent().find('select').should('have.value', '')

    //             // Retries until the count returns to the baseline
    //             cy.contains(/Activities \(\d+\)/).should('have.text', `Activities (${before})`)
    //         })
    //     })
    // })

    // ==========================================================
    // NEW ACTIVITY MODAL
    // ==========================================================
    // context('New activity modal', () => {

    //     it('TC25 - should open the New activity modal', () => {
    //         openNewActivityModal()
    //         cy.contains('button', /^create$/i).should('be.visible')
    //         cy.contains('button', /^cancel$/i).should('be.visible')
    //     })

    //     it('TC26 - should display all fields in the modal', () => {
    //         openNewActivityModal()
    //         field('^type').should('be.visible')
    //         field('^logged at').should('be.visible')
    //         field('^subject').should('be.visible')
    //         field('^link to deal').should('be.visible')
    //         field('^link to contact').should('be.visible')
    //         field('^notes').should('be.visible')
    //     })

    //     it('TC27 - should default type to task', () => {
    //         openNewActivityModal()

    //         cy.get('.modal-overlay')
    //             .contains('label', /^type/i)
    //             .parent()
    //             .find('select')
    //             .should('have.value', 'task')
    //     })

    //     it('TC28 - should pre-fill Logged At with the current date/time', () => {
    //         openNewActivityModal()
    //         field('^logged at').parent().find('input')
    //             .invoke('val')
    //             .should('match', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)
    //     })

    //     it('TC29 - should list task, call and meeting in type dropdown', () => {
    //         openNewActivityModal()
    //         field('^type').parent().find('select option').then(($o) => {
    //             const values = [...$o].map((o) => o.textContent.trim().toLowerCase())
    //             expect(values).to.include.members(['task', 'call', 'meeting'])
    //         })
    //     })

    //     it('TC30 - should default deal and contact links to none', () => {
    //         openNewActivityModal()
    //         field('^link to deal').parent().find('select').should('contain', 'none')
    //         field('^link to contact').parent().find('select').should('contain', 'none')
    //     })

    //     it('TC31 - should close modal using Cancel button', () => {
    //         openNewActivityModal()
    //         cy.get('.modal-overlay').contains('button', /^cancel$/i).click()
    //         cy.get('.modal-overlay').should('not.exist')
    //     })

    //     it('TC32 - should close modal using the X button', () => {
    //         openNewActivityModal()

    //         // X button is the first button inside the modal header
    //         cy.get('.modal-overlay').find('button').first().click()

    //         cy.get('.modal-overlay').should('not.exist')
    //     })

    //     it('TC33 - should not create activity when subject is empty', () => {
    //         openNewActivityModal()

    //         cy.get('.modal-overlay').within(() => {
    //             cy.contains('button', /^create$/i).click()
    //             cy.contains('Subject is required.').should('be.visible')
    //         })

    //         // Modal stays open
    //         cy.get('.modal-overlay').should('be.visible')
    //     })

    //     it('TC34 - should not create activity when subject is only spaces', () => {
    //         openNewActivityModal()
    //         field('^subject').parent().find('input').type('     ')
    //         cy.contains('button', /^create$/i).click()
    //         cy.contains('New activity').should('be.visible')
    //     })

    //     it('TC35 - should not create activity when Logged At is cleared', () => {
    //         openNewActivityModal()

    //         cy.get('.modal-overlay').within(() => {
    //             cy.contains('label', /^subject/i).parent().find('input').type(uniqueSubject())
    //             cy.contains('label', /^logged at/i).parent().find('input').clear()
    //             cy.contains('button', /^create$/i).click()

    //             cy.contains('Logged at is required.').should('be.visible')
    //         })

    //         // Modal stays open, so the activity was not created
    //         cy.get('.modal-overlay').should('be.visible')
    //     })
    // })

    // ==========================================================
    // CREATE
    // ==========================================================
    context('Create activity', () => {

        it('TC36 - should create a task with only mandatory fields', () => {
            cy.contains('button', /new activity/i).click()

            cy.get('.modal-overlay').within(() => {
                cy.contains('label', /^subject/i).parent().find('input').type('Test Task')
                cy.contains('button', /^create$/i).click()
            })
        })

        it('TC37 - should create a call', () => {
            cy.contains('button', /new activity/i).click()

            cy.get('.modal-overlay').within(() => {
                cy.contains('label', /^type/i).parent().find('select').select('call')
                cy.contains('label', /^subject/i).parent().find('input').type('Test Call')
                cy.contains('button', /^create$/i).click()
            })
        })

        it('TC38 - should create a meeting', () => {
            cy.contains('button', /new activity/i).click()

            cy.get('.modal-overlay').within(() => {
                cy.contains('label', /^type/i).parent().find('select').select('meeting')
                cy.contains('label', /^subject/i).parent().find('input').type('Test Meeting')
                cy.contains('button', /^create$/i).click()
            })
        })

        it('TC39 - should create an activity with notes', () => {
            cy.contains('button', /new activity/i).click()

            cy.get('.modal-overlay').within(() => {
                cy.contains('label', /^subject/i).parent().find('input').type('Test Notes')
                cy.contains('label', /^notes/i).parent().find('textarea').type('Automation notes')
                cy.contains('button', /^create$/i).click()
            })
        })

        it('TC40 - should create an activity linked to a deal', () => {
            const subject = uniqueSubject('DEAL')
            openNewActivityModal()
            field('^subject').parent().find('input').type(subject)
            field('^link to deal').parent().find('select').select(1)
            cy.contains('button', /^create$/i).click()

            searchFor(subject)
            rowFor(subject).should('contain', 'DEAL-')

            deleteActivity(subject)
        })

        it('TC41 - should create an activity with a back-dated Logged At', () => {
            const subject = uniqueSubject('BACK')
            openNewActivityModal()
            field('^subject').parent().find('input').type(subject)
            field('^logged at').parent().find('input').type('2026-01-15T10:30')
            cy.contains('button', /^create$/i).click()

            searchFor(subject)
            rowFor(subject).should('contain', '15/01/2026')
            deleteActivity(subject)
        })

        it('TC42 - should set the logged-in user as owner', () => {
            cy.contains('button', /new activity/i).click()

            cy.get('.modal-overlay').within(() => {
                cy.contains('label', /^subject/i).parent().find('input').type('Test Owner')
                cy.contains('button', /^create$/i).click()
            })

            cy.contains('tbody tr', 'Test Owner').should('contain', 'admin')
        })
    })
        it('TC43 - should increase the activities count after creation', () => {
            cy.get('tbody tr').should('have.length.greaterThan', 0)

            getSettledCount().then((before) => {
                cy.contains('button', /new activity/i).click()

                cy.get('.modal-overlay').within(() => {
                    cy.contains('label', /^subject/i).parent().find('input').type('Test Count')
                    cy.contains('button', /^create$/i).click()
                })

                cy.contains(`Activities (${before + 1})`).should('be.visible')
            })
    })

    // ==========================================================
    // EDIT
    // ==========================================================
    context('Edit activity', () => {

        it('TC44 - should open edit modal prefilled with existing values', () => {
            const subject = uniqueSubject('EDIT')
            createActivity({ type: 'call', subject })

            searchFor(subject)
            rowFor(subject).find('button[title*="dit" i], button:nth-child(2)').click()
            field('^subject').parent().find('input').should('have.value', subject)
            field('^type').parent().find('select').should('have.value', 'call')

            cy.contains('button', /^cancel$/i).click()
            deleteActivity(subject)
        })

        it('TC45 - should update subject of an activity', () => {
            const subject = uniqueSubject('EDIT')
            const updated = `${subject}-UPDATED`
            createActivity({ type: 'task', subject })

            searchFor(subject)
            rowFor(subject).find('button[title*="dit" i], button:nth-child(2)').click()
            field('^subject').parent().find('input').clear().type(updated)
            cy.contains('button', /save|update/i).click()

            searchFor(updated)
            rowFor(updated).should('be.visible')

            deleteActivity(updated)
        })

        it('TC46 - should update the type of an activity', () => {
            const subject = uniqueSubject('EDIT')
            createActivity({ type: 'task', subject })

            searchFor(subject)
            rowFor(subject).find('button[title*="dit" i], button:nth-child(2)').click()
            field('^type').parent().find('select').select('meeting')
            cy.contains('button', /save|update/i).click()

            searchFor(subject)
            rowFor(subject).should('contain', 'meeting')

            deleteActivity(subject)
        })

        it('TC47 - should not save when subject is cleared during edit', () => {
            const subject = uniqueSubject('EDIT')
            createActivity({ type: 'task', subject })

            searchFor(subject)
            rowFor(subject).find('button[title*="dit" i], button:nth-child(2)').click()
            field('^subject').parent().find('input').clear()
            cy.contains('button', /save|update/i).click()
            field('^subject').should('be.visible') // modal still open

            cy.contains('button', /^cancel$/i).click()
            deleteActivity(subject)
        })
    })

    // ==========================================================
    // COMPLETE
    // ==========================================================
    context('Complete activity', () => {

        it('TC48 - should mark an activity as completed', () => {
            const subject = uniqueSubject('DONE')
            createActivity({ type: 'task', subject })

            searchFor(subject)
            rowFor(subject).find('button').first().click() // green tick

            // no longer in Open tab
            cy.contains('button', /^open$/i).click()
            searchFor(subject)
            cy.contains(sel.rows, subject).should('not.exist')

            // visible in Completed tab
            cy.contains('button', /^completed$/i).click()
            searchFor(subject)
            rowFor(subject).should('be.visible')

            deleteActivity(subject)
        })

        it('TC49 - should remove overdue highlight once completed', () => {
            const subject = uniqueSubject('OVERDUE')
            openNewActivityModal()
            field('^subject').parent().find('input').type(subject)
            cy.contains('button', /^create$/i).click()

            searchFor(subject)
            rowFor(subject).find('button').first().click()

            cy.contains('button', /^completed$/i).click()
            searchFor(subject)
            rowFor(subject).should('not.contain', 'overdue')

            deleteActivity(subject)
        })
    })

    // ==========================================================
    // DELETE
    // ==========================================================
    context('Delete activity', () => {

        it('TC50 - should delete an activity', () => {
            const subject = uniqueSubject('DEL')
            createActivity({ type: 'task', subject })

            cy.on('window:confirm', () => true)
            searchFor(subject)
            rowFor(subject).find('button').last().click()

            searchFor(subject)
            cy.contains(sel.rows, subject).should('not.exist')
        })

        it('TC51 - should not delete when confirmation is cancelled', () => {
            const subject = uniqueSubject('DEL')
            createActivity({ type: 'task', subject })

            cy.on('window:confirm', () => false)
            searchFor(subject)
            rowFor(subject).find('button').last().click()

            rowFor(subject).should('be.visible')

            deleteActivity(subject)
        })

        it('TC52 - should decrease the activities count after deletion', () => {
            const subject = uniqueSubject('DEL')
            createActivity({ type: 'task', subject })

            cy.contains(/Activities \((\d+)\)/).invoke('text').then((t) => {
                const before = Number(t.match(/\((\d+)\)/)[1])
                deleteActivity(subject)
                cy.contains(`Activities (${before - 1})`).should('be.visible')
            })
        })
    })

    // ==========================================================
    // DISPLAY RULES
    // ==========================================================
    context('Display rules', () => {

        it('TC53 - should show overdue badge on past-due open activities', () => {
            cy.get(sel.rows).filter(':contains("overdue")').should('have.length.at.least', 1)
        })

        it('TC54 - should show a dash when an activity has no linked deal', () => {
            cy.contains('button', /^all$/i).click()
            cy.get(sel.rows).filter(':contains("—")').should('have.length.at.least', 1)
        })

        it('TC55 - should show linked deal ids in DEAL-XXXXXX format', () => {
            cy.contains('button', /^all$/i).click()
            cy.get(sel.rows).filter(':contains("DEAL-")').first()
                .invoke('text').should('match', /DEAL-\d{6}/)
        })
    })

    // ==========================================================
    // NAVIGATION / SESSION
    // ==========================================================
    context('Navigation', () => {

        it('TC56 - should highlight Activities in the sidebar', () => {
            cy.contains('a', 'Activities')
                .should('have.css', 'background-color')
                .and('not.eq', 'rgba(0, 0, 0, 0)')
        })

        it('TC57 - should keep user on the page after reload', () => {
            cy.reload()
            cy.url().should('include', '/activities')
            cy.contains('h1, h2', 'Activities').should('be.visible')
        })
    })
})