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

import DashboardPage from './page-objects/dashboard-page'
import LoginPage from './page-objects/login-page'

Cypress.Commands.add('login', (username, password) => {
  cy.session([username, password], () => {
    cy.visit('/auth/login')
    cy.get(LoginPage.emailInput).type(username)
    cy.get(LoginPage.passwordInput).type(password)
    cy.get(LoginPage.loginButton).click()
    cy.step('THEN I should login successfully')
    cy.get(DashboardPage.userNavMenu).should('be.visible')
  })

  // cy.visit('/')
  // cy.get('body').then(($body) => {
  //     if ($body.find(MainPage.cartButton).length === 0) {
  //         cy.get(LoginPage.usernameInput).should('be.visible').type(username)
  //         cy.get(LoginPage.passwordInput).type(password)
  //         cy.get(LoginPage.loginButton).click()
  //     }
  // })
  // cy.get(MainPage.cartButton, { timeout: 10000 }).should('be.visible')
})

Cypress.Commands.add('adminLogin', (username, password) => {
  cy.session([username, password], () => {
    cy.visit('/auth/login')
    cy.get(LoginPage.emailInput).type(username)
    cy.get(LoginPage.passwordInput).type(password)
    cy.get(LoginPage.loginButton).click()
    cy.step('THEN I should login successfully')
    cy.get(DashboardPage.adminLayout).should('be.visible')
  })
})
