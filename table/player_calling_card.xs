// Unlocked calling card inventory for players
table player_calling_card {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Player owning this unlocked card
    int player_id
  
    // Calling card unlocked
    int calling_card_id {
      table = "calling_card"
    }
  
    // Timestamp when card was unlocked
    timestamp unlocked_at?=now
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "player_id"}]}
    {type: "btree", field: [{name: "calling_card_id"}]}
  ]
}