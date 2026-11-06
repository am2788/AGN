// Season points ledger with strict idempotency and event types
table points_ledger {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Credited user account
    int user_id {
      table = "user"
    }
  
    // Point-awarding event type
    enum event_type {
      values = ["watch_15m", "prediction", "wager", "referral", "verified_entry"]
    }
  
    // Points earned for event
    int points
  
    // Unique idempotency key to prevent double rewards
    text idempotency_key filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "idempotency_key"}]}
    {type: "btree", field: [{name: "user_id"}]}
    {type: "btree", field: [{name: "event_type"}]}
  ]
}