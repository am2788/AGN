// Global regional pools for Weeks 1-4 tournament filtering
table region {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Region name
    text name filters=trim
  
    // Short region code
    text code filters=trim|upper
  
    // Nearest edge server cluster location
    text edge_server_cluster filters=trim
  
    // Active pool status
    bool is_active?=true
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "code"}]}
  ]
}