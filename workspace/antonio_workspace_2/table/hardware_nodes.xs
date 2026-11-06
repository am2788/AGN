// Competitive dedicated edge hardware nodes
table hardware_nodes {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Node identifier name
    text node_name filters=trim
  
    // Operating region: asia, europe, americas
    text region filters=trim
  
    // Operational health status
    enum status?=online {
      values = ["online", "offline", "degraded", "maintenance"]
    }
  
    // Internal node IP address
    text? ip_address filters=trim
  
    // Number of active matches routed through node
    int active_matches?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "region"}]}
    {type: "btree", field: [{name: "status"}]}
  ]
}