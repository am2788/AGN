// Performance milestones for automated calling card unlocks
table milestone {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Evaluated performance metric
    enum metric {
      values = [
        "matches_played"
        "match_wins"
        "tournaments_won"
        "level"
        "mvp_awards"
      ]
    
    }
  
    // Required metric threshold value
    int threshold
  
    // Calling card rewarded upon reaching threshold
    int reward_card_id {
      table = "calling_card"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "metric"}]}
    {type: "btree", field: [{name: "reward_card_id"}]}
  ]
}