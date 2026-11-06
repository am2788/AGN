// The Shield telemetry check-ins for competitive integrity
table shield_checkins {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Checked in user ID
    int user_id {
      table = "user"
    }
  
    // Optional associated match ID
    int? match_id
  
    // Physical connection link type: ethernet or wifi
    enum link_type {
      values = ["ethernet", "wifi"]
    }
  
    // Line packet jitter in milliseconds
    decimal jitter_ms
  
    // Verified regional edge server cluster name
    text? edge_server filters=trim
  
    // Telemetry integrity verdict
    enum result {
      values = ["pass", "warn", "boot"]
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "user_id"}]}
    {type: "btree", field: [{name: "match_id"}]}
    {type: "btree", field: [{name: "result"}]}
  ]
}