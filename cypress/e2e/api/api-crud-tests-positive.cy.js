/// <reference types="cypress" />
// Base URL for Typicode API
const baseUrl = Cypress.config('ApiBaseUrl')

const dataPayment = {
  id: 'inv-ea1d8138-24b1-485c-964d-4e8ba064566b',
  user_id: 'user-admin-1',
  invoice_number: 'INV-2026-0001',
  invoice_date: '2026-05-30T04:56:39.963Z',
  billing_first_name: 'Admin',
  billing_last_name: 'User',
  billing_email: 'admin@automationcamp.org',
  billing_address: '123 Admin Street',
  billing_city: 'Admin City',
  billing_state: 'CA',
  billing_country: 'US',
  billing_postal_code: '90001',
  payment_method: 'cash_on_delivery',
  payment_details: {},
  subtotal: 16.99,
  discount_amount: 0,
  total: 16.99,
  status: 'AWAITING_FULFILLMENT',
  status_message: 'Order received and awaiting processing',
  items: [
    {
      id: 'invitem-76807331-84ff-4044-942b-49f35201bca8',
      product_id: 'prod-9',
      product_name: 'Adjustable Wrench 10"',
      unit_price: 16.99,
      quantity: 1,
      discount_percentage: 0,
      line_total: 16.99,
      product: {
        id: 'prod-9',
        name: 'Adjustable Wrench 10"',
        description:
          '10-inch adjustable wrench with wide jaw opening of up to 32mm. Smooth jaw adjustment mechanism. Drop-forged chrome vanadium steel for durability.',
        stock: 55,
        price: 16.99,
        brand_id: 'brand-1',
        category_id: 'cat-1',
        is_location_offer: false,
        is_rental: false,
        co2_rating: 'B',
        image: '/assets/img/products/wrench01.jpeg',
        specs: [
          {
            name: 'Length',
            value: '10',
            unit: '"'
          },
          {
            name: 'Max Jaw Opening',
            value: '32',
            unit: 'mm'
          },
          {
            name: 'Material',
            value: 'Chrome Vanadium',
            unit: ''
          }
        ],
        created_at: '2024-01-01T00:00:00Z'
      }
    }
  ],
  created_at: '2026-05-30T04:56:39.963Z'
}

describe('Typicode API CRUD Tests', { tags: ['@api'] }, () => {
  function login(email) {
    return cy
      .request({
        method: 'POST',
        url: '/api/users/login',
        body: {
          email,
          password: 'welcome01'
        }
      })
      .then((response) => {
        expect(response.status).to.eq(200)
        return response.body.access_token
      })
  }

  function deleteProduct(token, productId) {
    return cy.request({
      method: 'DELETE',
      url: `/api/products/${productId}`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false
    })
  }

  function updateProduct(token, productId, updateData) {
    return cy.request({
      method: 'PUT',
      url: `/api/products/${productId}`,
      headers: { Authorization: `Bearer ${token}` },
      body: updateData
    })
  }

  function createProduct(token, productData) {
    return cy
      .request({
        method: 'POST',
        url: '/api/products',
        headers: { Authorization: `Bearer ${token}` },
        body: productData
      })
      .then((response) => {
        return response.body
      })
  }

  context('Product Creation with Cleanup', () => {
    let adminToken
    const createdProducts = []

    before(() => {
      login('admin@automationcamp.org').then((token) => {
        adminToken = token
      })
    })

    after(() => {
      // Clean up: Delete all products created during tests
      createdProducts.forEach((productId) => {
        deleteProduct(adminToken, productId)
      })
    })

    it('should create product and track for cleanup', () => {
      const product = {
        name: 'Temporary Product',
        price: 19.99,
        description: 'This will be deleted after test',
        category: 'Test',
        stock: 10,
        sku: 'TEMP-001'
      }

      cy.request({
        method: 'POST',
        url: '/api/products',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: product
      }).then((response) => {
        expect(response.status).to.eq(201)
        const productId = response.body.id
        createdProducts.push(productId)

        // Verify product exists
        cy.request({
          method: 'GET',
          url: `/api/products/${productId}`,
          headers: { Authorization: `Bearer ${adminToken}` }
        }).then((getResponse) => {
          expect(getResponse.status).to.eq(200)
          expect(getResponse.body.name).to.equal(product.name)
        })
      })
    })
  })

  //20,21,22
  context('admin can update a product via API', () => {
    let token
    let product

    before(() => {
      login('admin@automationcamp.org').then((t) => (token = t))
    })

    beforeEach(() => {
      createProduct(token, {
        name: 'Create Product',
        price: 75.0,
        description: 'Created Product',
        category: 'Testing',
        stock: 25,
        sku: 'CUSTOM-002'
      }).then((p) => (product = p))
    })

    afterEach(() => {
      deleteProduct(token, product.id)
    })

    it('should update product', () => {
      updateProduct(token, product.id, {
        name: 'Updated product',
        price: 125.0,
        stock: 60
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.name).to.equal('Updated product')
        expect(response.body.price).to.equal(125.0)
        expect(response.body.stock).to.equal(60)
        expect(response.body.sku).to.equal(product.sku)
      })
    })

    it('Verify the login API endpoint', () => {
      cy.request({
        method: 'POST',
        url: '/api/users/login',
        body: {
          email: 'customer@automationcamp.org',
          password: 'welcome01'
        }
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.user).to.have.property('id')
        expect(response.body.user).to.have.property('email')
        expect(response.body.user).to.have.property('role')
        expect(response.body).to.have.property('access_token')
      })
    })
  })

  //23
  context('create brand and clearance', () => {
    let token
    let brandId
    before(() => {
      login('admin@automationcamp.org').then((t) => (token = t))
    })

    after(() => {
      cy.request({
        method: 'DELETE',
        url: `/api/brands/${brandId}`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false
      })
    })

    it('Verify admin can create a brand via API', () => {
      cy.request({
        method: 'POST',
        url: '/api/brands',
        headers: { Authorization: `Bearer ${token}` },
        body: { name: 'adidas' }
      }).then((response) => {
        expect(response.status).to.eq(201)
        expect(response.body).to.have.property('id')
        expect(response.body).to.have.property('name')
        brandId = response.body.id
      })
    })
  })

  //24
  context('Product add to cart', () => {
    let authToken
    let cartId
    let productId = 'prod-1' // Use an actual product ID from your system

    before(() => {
      login('customer@automationcamp.org').then((t) => (authToken = t))
    })

    it('should create a new cart and add an item', () => {
      // Step 1: Create a new cart
      cy.request({
        method: 'POST',
        url: '/api/carts',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      }).then((createResponse) => {
        // Verify cart creation
        expect(createResponse.status).to.eq(201) // Your backend returns 201
        expect(createResponse.body).to.have.property('id')
        expect(createResponse.body).to.have.property('items').that.is.an('array')
        expect(createResponse.body.items).to.have.length(0)
        expect(createResponse.body.subtotal).to.eq(0)

        cartId = createResponse.body.id
        cy.log(`Cart created with ID: ${cartId}`)

        // Step 2: Add item to cart using correct endpoint
        const addItemData = {
          product_id: productId,
          quantity: 2
        }

        cy.request({
          method: 'POST',
          url: `/api/carts/${cartId}`, // CORRECTED: /api/carts/:id not /items
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
          body: addItemData
        }).then((addResponse) => {
          // Verify item addition - your backend returns 200
          expect(addResponse.status).to.eq(200)

          // Verify response structure matches your backend
          expect(addResponse.body).to.have.property('id', cartId)
          expect(addResponse.body).to.have.property('items').that.is.an('array')
          expect(addResponse.body.items).to.have.length(1)

          // Verify item details
          const addedItem = addResponse.body.items[0]
          expect(addedItem).to.have.property('product_id', productId)
          expect(addedItem).to.have.property('quantity', 2)
          expect(addedItem).to.have.property('unit_price')
          expect(addedItem).to.have.property('line_total')

          // Verify subtotal is calculated correctly
          const expectedSubtotal = addedItem.unit_price * 2
          expect(addResponse.body.subtotal).to.eq(expectedSubtotal)

          cy.log('Item added to cart successfully')

          // Step 3: Get cart and verify item exists
          cy.request({
            method: 'GET',
            url: `/api/carts/${cartId}`,
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
          }).then((getResponse) => {
            expect(getResponse.status).to.eq(200)
            expect(getResponse.body).to.have.property('id', cartId)
            expect(getResponse.body).to.have.property('items').that.is.an('array')

            // Verify the added product appears in cart
            const cartItems = getResponse.body.items
            expect(cartItems).to.have.length(1)

            const addedItemInGet = cartItems.find((item) => item.product_id === productId)
            expect(addedItemInGet).to.exist
            expect(addedItemInGet.quantity).to.eq(2)

            cy.log('Cart verified with added product')
          })
        })
      })
    })
  })

  //25
  context('POST place order (authenticated)', () => {
    let authToken
    let cartId
    let productId = 'prod-1'
    let invoiceId
    let invoiceNumber

    before(() => {
      login('customer@automationcamp.org').then((t) => (authToken = t))
    })

    beforeEach(() => {
      // Create a cart with an item before each test
      cy.request({
        method: 'POST',
        url: '/api/carts',
        headers: { Authorization: `Bearer ${authToken}` }
      }).then((cartResponse) => {
        cartId = cartResponse.body.id

        cy.request({
          method: 'POST',
          url: `/api/carts/${cartId}`,
          headers: { Authorization: `Bearer ${authToken}` },
          body: { product_id: productId, quantity: 2 }
        })
      })
    })

    it('should create an order (invoice) from cart with valid details', () => {
      const orderData = {
        cart_id: cartId,
        billing_first_name: 'John',
        billing_last_name: 'Doe',
        billing_email: 'john.doe@example.com',
        billing_address: '123 Main Street',
        billing_city: 'New York',
        billing_state: 'NY',
        billing_country: 'USA',
        billing_postal_code: '10001',
        payment_method: 'credit_card',
        payment_details: {
          card_last4: '4242',
          card_brand: 'visa'
        }
      }

      cy.request({
        method: 'POST',
        url: '/api/invoices',
        headers: { Authorization: `Bearer ${authToken}` },
        body: orderData
      }).then((response) => {
        // Verify status 201
        expect(response.status).to.eq(201)

        // Verify response structure
        expect(response.body).to.have.property('id')
        expect(response.body).to.have.property('invoice_number')
        expect(response.body).to.have.property('invoice_date')
        expect(response.body).to.have.property('user_id')
        expect(response.body).to.have.property('status', 'AWAITING_FULFILLMENT')
        expect(response.body).to.have.property('status_message', 'Order received and awaiting processing')
        expect(response.body).to.have.property('items').that.is.an('array')
        expect(response.body).to.have.property('subtotal')
        expect(response.body).to.have.property('total')

        // Verify billing details
        expect(response.body.billing_first_name).to.eq('John')
        expect(response.body.billing_last_name).to.eq('Doe')
        expect(response.body.billing_email).to.eq('john.doe@example.com')
        expect(response.body.billing_address).to.eq('123 Main Street')
        expect(response.body.billing_city).to.eq('New York')
        expect(response.body.billing_state).to.eq('NY')
        expect(response.body.billing_country).to.eq('USA')
        expect(response.body.billing_postal_code).to.eq('10001')

        // Verify payment details
        expect(response.body.payment_method).to.eq('credit_card')
        expect(response.body.payment_details).to.have.property('card_last4', '4242')
        expect(response.body.payment_details).to.have.property('card_brand', 'visa')

        // Verify items from cart are included
        expect(response.body.items).to.have.length(1)
        expect(response.body.items[0].product_id).to.eq(productId)
        expect(response.body.items[0].quantity).to.eq(2)
        expect(response.body.items[0]).to.have.property('product_name')
        expect(response.body.items[0]).to.have.property('unit_price')
        expect(response.body.items[0]).to.have.property('line_total')

        // Store for later verification
        invoiceId = response.body.id
        invoiceNumber = response.body.invoice_number

        cy.log(`Order created: ${invoiceNumber} with ID: ${invoiceId}`)
      })
    })

    it('should verify cart is deleted after order placement', () => {
      const orderData = {
        cart_id: cartId,
        billing_first_name: 'Jane',
        billing_last_name: 'Smith',
        billing_email: 'jane.smith@example.com',
        billing_address: '456 Oak Avenue',
        billing_city: 'Los Angeles',
        billing_state: 'CA',
        billing_country: 'USA',
        billing_postal_code: '90001',
        payment_method: 'paypal'
      }

      // Place order
      cy.request({
        method: 'POST',
        url: '/api/invoices',
        headers: { Authorization: `Bearer ${authToken}` },
        body: orderData
      }).then((response) => {
        expect(response.status).to.eq(201)

        // Verify cart is deleted (should return 404)
        cy.request({
          method: 'GET',
          url: `/api/carts/${cartId}`,
          headers: { Authorization: `Bearer ${authToken}` },
          failOnStatusCode: false
        }).then((cartResponse) => {
          expect(cartResponse.status).to.eq(404)
          expect(cartResponse.body.message).to.eq('Cart not found')
        })
      })
    })
  })

  //26
  context('Product add to favorites and clearance', () => {
    let token
    let favId
    before(() => {
      login('customer@automationcamp.org').then((t) => (token = t))
    })

    after(() => {
      cy.request({
        method: 'DELETE',
        url: `/api/favorites/${favId}`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false
      })
    })

    it('Verify user can add a product to favorites list via API', () => {
      cy.request({
        method: 'POST',
        url: '/api/favorites',
        headers: { Authorization: `Bearer ${token}` },
        body: { product_id: 'prod-8' }
      }).then((response) => {
        expect(response.status).to.eq(201)
        expect(response.body).to.have.property('id')
        expect(response.body).to.have.property('product_id')
        favId = response.body.id
      })
    })
  })

  context('READ Operations', () => {
    //18
    it('Should GET all products', () => {
      cy.api({
        method: 'GET',
        url: `${baseUrl}api/products`
      }).then((response) => {
        const data = response.body.data
        expect(response.status).to.eq(200)
        expect(data).to.be.an('array')
        expect(data[0]).to.have.property('id')
        expect(data[0]).to.have.property('name')
        expect(data[0]).to.have.property('price')
      })
    })

    //27
    it('API authentication - missing token', () => {
      cy.api({
        method: 'GET',
        url: `${baseUrl}api/users/me`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401)
        expect(response.body.message).to.equal('Access token is required')
      })
    })
  })
})
