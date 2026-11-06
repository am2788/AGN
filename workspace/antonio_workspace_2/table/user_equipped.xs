// User currently equipped cosmetics (theme is authoritatively stored on profile)
table user_equipped {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // User owning equipped cosmetics
    int user_id {
      table = "user"
    }
  
    // Currently equipped calling card ID
    int? calling_card_id
  
    // Currently equipped emblem ID
    int? emblem_id
  
    // Currently equipped medal ID
    int? medal_id
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "user_id"}]}
  ]
}