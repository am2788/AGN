// Merchandise products for AGN, ASN, and platform stores
table merch_product {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Product title
    text name filters=trim
  
    // Product description
    text? description
  
    // Merchandise category
    enum category {
      values = [
        "apparel"
        "team_merch"
        "accessories"
        "collectibles"
        "event_drop"
      ]
    
    }
  
    // Retail price in USD
    decimal price filters=min:0
  
    // Catalog product image URL
    text? image_url filters=trim
  
    // Availability status
    bool is_active?=true
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "category"}]}
    {type: "btree", field: [{name: "is_active"}]}
  ]
}