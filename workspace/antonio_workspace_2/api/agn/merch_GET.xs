// Merchandise catalog for AGN, ASN, and platform drops
query merch verb=GET {
  api_group = "AGN"

  input {
    // Optional category filter
    text? category
  }

  stack {
    // Query active merchandise products
    db.query merch_product {
      where = $db.merch_product.is_active == true && $db.merch_product.category ==? $input.category
      sort = {id: "asc"}
      return = {type: "list"}
    } as $products
  }

  response = {products: $products}
}