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
  
    // Equipped emblem image URL
    text equipped_emblem_url?
  
    // Equipped medal slot 1 image URL
    text equipped_medal_1?
  
    // Equipped medal slot 2 image URL
    text equipped_medal_2?
  
    // Equipped medal slot 3 image URL
    text equipped_medal_3?
  
    // Equipped calling card image or animation URL
    text equipped_card_url?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "user_id"}]}
  ]
}