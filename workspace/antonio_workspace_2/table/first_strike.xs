// First Strike category claim record
table first_strike {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Claiming player user ID
    int? claimed_by_user_id {
      table = "user"
    }
  
    // Claiming competitive team ID
    int? claimed_by_team_id {
      table = "team"
    }
  
    // First Strike category: tournament, lane, or global
    text category filters=trim
  
    // Exact timestamp when First Strike was claimed
    timestamp? claimed_at
  
    // Verified payment transaction ID that unlocked First Strike
    text? payment_id filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "category"}]}
    {type: "btree", field: [{name: "claimed_by_user_id"}]}
    {type: "btree", field: [{name: "claimed_by_team_id"}]}
  ]
}