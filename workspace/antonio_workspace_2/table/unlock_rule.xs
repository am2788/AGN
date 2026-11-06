// Cosmetic unlock condition rules
table unlock_rule {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Type of unlock condition
    enum type {
      values = ["achievement", "milestone", "engagement"]
    }
  
    // Threshold quantity required to unlock
    int threshold?
  
    // Source metric or action name
    text source filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "type"}]}
  ]
}