// Network integrity and connection alert logs
table connection_alerts {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Affected user account
    int user_id {
      table = "user"
    }
  
    // Alert severity level
    enum severity {
      values = ["low", "medium", "high", "critical"]
    }
  
    // Detailed alert message
    text message filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "user_id"}]}
    {type: "btree", field: [{name: "severity"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}