/// <reference types="cypress" />

// Page objects
import LoginPage from '../../support/page-objects/login-page'
import DashboardPage from '../../support/page-objects/dashboard-page'
import MainPage from '../../support/page-objects/main-page'
import registerPage from '../../support/page-objects/register-page'

// Configurations
let username
let password

before(() => {
  cy.env(['username', 'password']).then((env) => {
    username = env.username
    password = env.password
  })
})

let userRegisterData = {
  firstName: 'asghar',
  lastName: 'farhadi',
  dob: '1994-12-23',
  country: 'iran',
  postalCode: '12345678',
  houseNumber: '77',
  streetNo: '77',
  city: 'tehran',
  state: 'tehran',
  phone: '0912123456789',
  email: 'photoshop@gmail.com',
  password: 'Aafsa@12354jmfjksl564456'
}

/**
 * Used Gherkin Syntax + cy.step() for better logs and more clear test steps
 */
describe('Authentication Tests', { tags: ['@ui'] }, () => {
  context('When user is logged out', () => {
    beforeEach(() => {
      cy.step("GIVEN I'm in Login page")
      cy.visit('/')
    })

    //1
    it('Should login with valid credentials', { tags: ['@smoke', '@regression'] }, () => {
      cy.step('WHEN I put valid credentials and click the Login button')
      cy.get(MainPage.signInBtn).click()
      cy.get(LoginPage.emailInput).should('be.visible')
      cy.get(LoginPage.emailInput).type('customer@automationcamp.org')
      cy.get(LoginPage.passwordInput).type(password)
      cy.get(LoginPage.loginButton).click()
      cy.step('THEN I should login successfully')
      cy.get(DashboardPage.userNavMenu).should('be.visible')
    })

    //2
    it('Should not login with invalid credentials', { tags: ['@regression'] }, () => {
      cy.step('WHEN I put invalid credentials and click the Login button')
      cy.visit('/auth/login')
      cy.get(LoginPage.emailInput).type(username)
      cy.get(LoginPage.passwordInput).type('invalid_password')
      cy.get(LoginPage.loginButton).click()
      cy.step('THEN I should see error message')
      cy.get(LoginPage.loginError).should('be.visible').and('contain.text', 'Invalid credentials')
    })

    //3
    it('Should register new user read valid data', { tags: ['@regression'] }, () => {
      cy.step('WHEN I click the login without putting credentials')
      cy.visit('/auth/register')
      cy.get(registerPage.firstNameInput).type(userRegisterData.firstName)
      cy.get(registerPage.lastNameInput).type(userRegisterData.lastName)
      cy.get(registerPage.phone).type(userRegisterData.phone)
      cy.get(registerPage.emailAddress).type(userRegisterData.email)
      cy.get(registerPage.password).type(userRegisterData.password)
      cy.get(registerPage.passwordConfirm).type(userRegisterData.password)
      cy.get(registerPage.dobInput).type(userRegisterData.dob)
      cy.get(registerPage.registerSubmit).click()
      cy.step('THEN I should register successfully')
      cy.visit('/auth/login')
      cy.login(userRegisterData.email, userRegisterData.password)
    })
  })
})
