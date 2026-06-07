class CartPage {
  static inputQuantity = 'input.quantity'
  static totalPrice =
    'body > app-root > div.container > app-checkout > aw-wizard > div > aw-wizard-step:nth-child(1) > div > table > tfoot > tr > td:nth-child(5)'
  static checkoutButton = "[data-test='checkout']"
}

export default CartPage
