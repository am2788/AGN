// User moderation and account safety flags
table safety_flags {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Flagged user account
    int user_id {
      table = "user"
    }
  
    // Type of safety flag (age_mismatch, dm_held, toxicity, etc.)
    text flag_type filters=trim
  
    // Context or trigger reason for safety flag
    text reason filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "user_id"}]}
    {type: "btree", field: [{name: "flag_type"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}