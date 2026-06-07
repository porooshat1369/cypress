class MainPage {
  // Header
  static cartButton = '[data-testid="shopping-cart-link"]'
  static userAvatar = '[data-testid="user-avatar"]'
  static menuButton = '#menu'
  static cartBadge = '.shopping_cart_badge'

  // Products
  static addToCartButton = (name) => `[data-testid="add-to-cart-sauce-labs-${name}"]`
  static removeFromCartButton = (name) => `[data-testid="remove-sauce-labs-${name}"]`
  static itemPrice = '[data-testid="inventory-item-price"]'

  // Menu button
  static allItemsButton = '#inventory_sidebar_link'
  static aboutButton = '#about_sidebar_link'
  static logoutButton = "[data-testid='nav-sign-out']"
  static closeMenuButton = '#react-burger-cross-btn'
  static signInBtn = "[data-id='nav-sign-in']"
  static searchInput = "[data-testid='search-query']"
  static searchSubmit = "[data-id='search-btn']"
  static powerToolsCat = "[data-testid='category-power-tools']"
  static filteredProductGrid = '[data-testid="filter_completed"]'
  static sortCombo = '[data-testid="sort-select"]'
  static productGrid = '[data-testid="product-grid"]'
}

export default MainPage
