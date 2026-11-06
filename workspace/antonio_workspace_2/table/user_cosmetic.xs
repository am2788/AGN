// User cosmetic unlock inventory
table user_cosmetic {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // User who owns the unlocked cosmetic
    int user_id {
      table = "user"
    }
  
    // Cosmetic type: calling_card, emblem, or medal
    enum cosmetic_type {
      values = ["calling_card", "emblem", "medal"]
    }
  
    // Target cosmetic ID in respective table
    int cosmetic_id
  
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
        {name: "cosmetic_id"}
      ]
    }
    {type: "btree", field: [{name: "user_id"}]}
  ]
}