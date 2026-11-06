// Bi-directional friendship requests and connections
table friendship {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Request sender
    int requester_id {
      table = "user"
    }
  
    // Request recipient
    int recipient_id {
      table = "user"
    }
  
    // Friendship connection state
    enum status?=pending {
      values = ["pending", "accepted", "declined", "blocked"]
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {
      type : "btree|unique"
      field: [{name: "requester_id"}, {name: "recipient_id"}]
    }
    {type: "btree", field: [{name: "recipient_id"}]}
    {type: "btree", field: [{name: "status"}]}
  ]
}