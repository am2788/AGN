// Wagers placed on daily matches and marquee matchups
table wager {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Bettor user account
    int user_id {
      table = "user"
    }
  
    // Match identifier or match reference
    int match_id
  
    // Selected team, player, or outcome pick
    text pick filters=trim
  
    // Staked wager amount
    decimal amount filters=min:1
  
    // Decimal odds multiplier at placement
    decimal odds filters=min:1
  
    // Calculated potential payout on win
    decimal potential_payout
  
    // Current wager resolution state
    enum status?=pending {
      values = ["pending", "won", "lost", "refunded"]
    }
  
    // Timestamp when winnings were credited to wallet
    timestamp? paid_at
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "user_id"}]}
    {type: "btree", field: [{name: "match_id"}]}
    {type: "btree", field: [{name: "status"}]}
  ]
}