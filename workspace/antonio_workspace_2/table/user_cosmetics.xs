// Cosmetic reward inventory tracking unlocked emblems, medals, and calling cards
table user_cosmetics {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // User owning this cosmetic reward
    int user_id {
      table = "user"
    }
  
    // Type of cosmetic reward: emblem, medal, or card
    enum cosmetic_type {
      values = ["emblem", "medal", "card"]
    }
  
    // Numeric asset identifier (1 to 50)
    int asset_id filters=min:1|max:50
  
    // Rarity tier of the cosmetic item
    enum tier {
      values = ["bronze", "silver", "gold", "legendary"]
    }
  
    // Timestamp when cosmetic was unlocked
    timestamp unlocked_at?=now
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {
      type : "btree|unique"
      field: [
        {name: "user_id"}
        {name: "cosmetic_type"}
        {name: "asset_id"}
        {name: "tier"}
      ]
    }
    {type: "btree", field: [{name: "user_id"}]}
  ]
}