// Unlocked player achievement records
table player_achievement {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Associated player
    int player_id {
      table = "player"
    }
  
    // Associated achievement
    int achievement_id {
      table = "achievement"
    }
  
    // Whether achievement has been unlocked
    bool achieved?=true
  
    // Timestamp when unlocked
    timestamp? achieved_at?=now
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "player_id"}]}
    {type: "btree", field: [{name: "achievement_id"}]}
  ]
}