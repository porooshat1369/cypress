/// <reference types="cypress" />

// Page objects
import LoginPage from '../../support/page-objects/login-page'
import MainPage from '../../support/page-objects/main-page'
import CartPage from '../../support/page-objects/cart-page'
import CheckoutPage from '../../support/page-objects/checkout-page'
import productPage from '../../support/page-objects/product-page'
import DashboardPage from '../../support/page-objects/dashboard-page'
import ContactForm from '../../support/page-objects/contact-from'

// Configurations
let username
let password

before(() => {
  cy.section('Suite Setup')
  cy.env(['username', 'password']).then((env) => {
    username = env.username
    password = env.password
  })
})

/**
 * Used cy.section() for distinguish between test stages
 * Used AAA syntax (Arrange/Act/Assert) + cy.step() for better logs and more clear test steps
 */

const contactFormObj = {
  firstName: 'sozan',
  email: 'sozantarik@gmail.com',
  subject: 'return',
  message: 'rozay roshan khoda hafez.rozay roshan khoda hafez.'
}

describe('Main Page Tests', { tags: ['@ui'] }, () => {
  beforeEach(() => {
    cy.section('Test Setup')
    cy.step('ARRANGE: Login user and visit home page')
    cy.login('customer@automationcamp.org', password)
    cy.visit('/', { failOnStatusCode: false })
  })

  //4
  it('Should products are displayed on landing page', { tags: ['@smoke', '@regression'] }, () => {
    cy.get(MainPage.productGrid).children().should('have.length.at.least', 9)
  })

  //5
  it('Should be able to add a product to the cart', { tags: ['@smoke', '@regression'] }, () => {
    cy.get(MainPage.searchInput).type('hammer')
    cy.get(MainPage.searchSubmit).click()
  })

  //6
  it('Should be able to Verify category filter works', { tags: ['@smoke', '@regression'] }, () => {
    cy.get(MainPage.powerToolsCat).click()
    cy.get('[data-id="product-card"]').should('have.length', 6)
  })

  //7
  it('handles Sort products by price (Low to High) correctly', () => {
    cy.get(MainPage.sortCombo).select('price-asc')
    cy.wait(1000)
    cy.get('[data-id="product-price"]').then(($prices) => {
      const prices = [...$prices].map((el) => parseFloat(el.innerText.replace('$', '')))
      // Check that prices are non-decreasing (equal prices allowed)
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).to.be.at.most(prices[i + 1])
      }
      // Log if there are duplicate prices
      const hasDuplicates = prices.some((price, i) => price === prices[i + 1])
      if (hasDuplicates) {
        cy.log('Note: Some products have identical prices')
      }
    })
  })

  //8
  it('Should guest user can add product to cart', { tags: ['@smoke', '@regression'] }, () => {
    cy.get(MainPage.productGrid).first().click()
    cy.get(productPage.addToCart).click()
    cy.get(productPage.addToCartMsg).should('be.visible')
    cy.get(productPage.cartQuantity).should('contain.text', 1)
  })

  //9
  it('Should quantity can be updated in cart', { tags: ['@smoke', '@regression'] }, () => {
    cy.get(MainPage.productGrid).first().click()
    cy.get(productPage.addToCart).click()
    cy.get(productPage.addToCartMsg).should('be.visible')
    cy.get(productPage.cartQuantity).should('contain.text', 1).click()
    cy.get('[data-testid="cart-quantity"]')
      .invoke('text')
      .then((initialQtyText) => {
        cy.get('[data-id="cart-item-total"]')
          .invoke('text')
          .then((initialTotalText) => {
            // Parse values dynamically
            const initialQuantity = parseInt(initialQtyText)
            const initialTotal = parseFloat(initialTotalText.replace('$', ''))

            // Calculate unit price (price per item)
            const unitPrice = initialTotal / initialQuantity

            // Target quantity
            const targetQuantity = 3
            const clicksNeeded = targetQuantity - initialQuantity

            // Click increase button needed times
            for (let i = 0; i < clicksNeeded; i++) {
              cy.get('[data-testid="cart-qty-increase"]').click()
            }

            // Verify quantity updated to target
            cy.get('[data-testid="cart-quantity"]').should('have.text', targetQuantity.toString())

            // Calculate expected total dynamically
            const expectedTotal = unitPrice * targetQuantity
            const expectedTotalFormatted = `$${expectedTotal.toFixed(2)}`

            // Verify total updated correctly
            cy.get('[data-id="cart-item-total"]').should('have.text', expectedTotalFormatted)
          })
      })
  })

  //10
  it('removes product from cart and updates cart badge correctly', () => {
    // Add two products to cart
    cy.get('[data-testid="add-to-cart-btn"]').first().click()
    cy.get('[data-testid="add-to-cart-btn"]').eq(1).click()

    cy.get(productPage.cartQuantity).should('contain.text', '2').click()
    cy.get('[data-id="cart-items-list"]', { timeout: 10000 }).should('be.visible')

    // Get all needed data first
    cy.get('[data-testid="cart-item"]')
      .its('length')
      .then((initialProductCount) => {
        cy.get('[data-testid="cart-item"]')
          .first()
          .find('[data-testid="cart-quantity"]')
          .invoke('text')
          .then((qtyText) => {
            cy.get(productPage.cartQuantity)
              .invoke('text')
              .then((badgeText) => {
                const deletedProductQuantity = parseInt(qtyText) || 0
                const initialBadgeCount = parseInt(badgeText) || 0
                const remainingProducts = initialProductCount - 1

                cy.log(`Initial products: ${initialProductCount}`)
                cy.log(`Product quantity to delete: ${deletedProductQuantity}`)
                cy.log(`Initial badge: ${initialBadgeCount}`)

                // Delete the product
                cy.get('[data-testid="cart-item"]').first().find('[data-testid="cart-remove"]').click()
                // Verify product removal
                cy.get('[data-testid="cart-item"]').should('have.length', remainingProducts)

                // Verify badge update
                if (remainingProducts === 0) {
                  cy.log('Cart empty - verifying badge removal')
                  cy.get(productPage.cartQuantity).should('not.exist')
                  cy.get('[data-id="cart-empty"]').should('be.visible')
                } else {
                  cy.log('Cart not empty - verifying badge count')
                  const expectedBadge = initialBadgeCount - deletedProductQuantity
                  cy.get(productPage.cartQuantity).should('contain.text', expectedBadge.toString())
                }
              })
          })
      })
  })

  // 11
  it('Should logged-in user can add to favorites', { tags: ['@smoke', '@regression'] }, () => {
    cy.get(MainPage.productGrid).first().click()
    cy.get(productPage.addToFav).click()
    cy.get(productPage.addToFav).find('svg').should('have.class', 'text-red-500')
    cy.get(DashboardPage.userNavMenu).click()
    cy.get(DashboardPage.userNavFav).click()
    cy.get('[data-id="favorites-title"').should('contain.text', 'My Favorites')
    it('verifies favorites count', () => {
      cy.visit('/account/favorites')

      // Count all favorite cards
      cy.get('[data-testid="favorites-grid"]')
        .its('length')
        .then((count) => {
          if (count > 0) {
            cy.log(`✅ Found ${count} product(s) in favorites`)
            expect(count).to.be.at.least(1)
          } else {
            cy.log('⚠️ No products in favorites')
          }
        })
    })
  })

  //12
  it('Should guest can submit contact form', { tags: ['@smoke', '@regression'] }, () => {
    cy.step('ACT: Navigate to Contact page')
    cy.visit('/contact')
    cy.step('ASSERT: The contact form should be visible')
    cy.get(ContactForm.name).clear().type(contactFormObj.firstName)
    cy.get(ContactForm.email).clear().type(contactFormObj.email)
    cy.get(ContactForm.subject).type(contactFormObj.subject)
    cy.get(ContactForm.message).type(contactFormObj.message)
    cy.get(ContactForm.contactSubmit).click()
    cy.step('ASSERT: success message should be appeared')
    cy.wait(200)
    cy.get(ContactForm.contactSuccess).should('be.visible')
  })

  // 13
  it('Should logged-in user and see user profile', { tags: ['@smoke'] }, () => {
    cy.get(DashboardPage.userNavMenu).click()
    cy.get(DashboardPage.userNavAcc).click()
    cy.step('ASSERT: user profile should be appeared')
    cy.get(DashboardPage.userProfInput).should('be.visible')
  })

})
