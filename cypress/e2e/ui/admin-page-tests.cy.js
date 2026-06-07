/// <reference types="cypress" />

import DashboardPage from '../../support/page-objects/dashboard-page'
import LoginPage from '../../support/page-objects/login-page'

let username
let password

before(() => {
  cy.section('Suite Setup')
  cy.env(['username', 'password']).then((env) => {
    username = env.username
    password = env.password
  })
})

describe('admin Page Tests', { tags: ['@ui'] }, () => {
  beforeEach(() => {
    cy.section('Test Setup')
    cy.step('ARRANGE: Login admin and visit admin page')
    cy.adminLogin(username, password)
    cy.visit('/admin', { failOnStatusCode: true })
  })

  //14
  it('Should admin be able to add a brand', { tags: ['@smoke', '@regression'] }, () => {
    cy.get(DashboardPage.navBrands).click()
    cy.get(DashboardPage.addBrandBtn).should('be.visible').click()
    cy.get(DashboardPage.brandName).should('be.visible').type('adidas')
    cy.get(DashboardPage.brandSlug).type('adidas')
    cy.get(DashboardPage.brandSubmit).click()
    cy.get('[data-id="admin-page-title"]').should('be.visible').should('contain.text', 'Brands')
  })

  //15
  it('Should admin be able to add a product', { tags: ['@smoke', '@regression'] }, () => {
    cy.get(DashboardPage.navProducts).click()
    cy.get(DashboardPage.addProductBtn).should('be.visible').click()
    cy.get(DashboardPage.productName).should('be.visible').type('adidas Gazelle Indoor Shoes')
    cy.get(DashboardPage.productDesc).type('adidas Gazelle Indoor Shoes')
    cy.get(DashboardPage.productPrice).type('111')
    cy.get(DashboardPage.productStock).type('11')
    cy.get(DashboardPage.productCategory).select('Hammers')
    cy.get(DashboardPage.productBrand).select('ForgeFlex')
    cy.get(DashboardPage.productSubmit).click()
    cy.get('[data-id="admin-page-title"]').should('be.visible').should('contain.text', 'Products')
  })

  //16
  it('Should admin be able to change an order status', { tags: ['@smoke', '@regression'] }, () => {
    cy.get(DashboardPage.navOrders).click()
    cy.get('[data-testid="orders-table"]').should('be.visible')
    cy.get('[data-testid="order-row"]').first().find('td').last().find('[data-testid="view-order"]').click()
    cy.get('[data-testid="status-select"]').select('SHIPPED')
    cy.get('[data-testid="update-status"]').click()
    cy.get('[data-id="order-status-badge"]').should('contain.text', 'SHIPPED')
  })

  //17
  it('Should admin be able to disable a user', { tags: ['@smoke', '@regression'] }, () => {
    cy.get(DashboardPage.navUsers).click()
    cy.get('[data-testid="users-table"]').should('be.visible')
    cy.contains('[data-id="user-email"]', 'customer3@automationcamp.org')
      .parent('tr')
      .find('[data-testid="edit-user"]')
      .click()
    cy.get('[data-testid="enabled"]').click()
    cy.get('[data-testid="submit-user"]').click()
    cy.get('[data-id="btn-admin-logout"]').click()
    cy.visit('/auth/login')
    cy.get(LoginPage.emailInput).type('customer3@automationcamp.org')
    cy.get(LoginPage.passwordInput).type('welcome01')
    cy.get(LoginPage.loginButton).click()
    cy.get(LoginPage.loginError).should('be.visible').should('contain.text', 'Your account has been disabled.')
  })
})
