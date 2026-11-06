// Social user following relationships
table follow {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Follower user ID
    int follower_id {
      table = "user"
    }
  
    // Target user being followed
    int following_id {
      table = "user"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {
      type : "btree|unique"
      field: [{name: "follower_id"}, {name: "following_id"}]
    }
    {type: "btree", field: [{name: "following_id"}]}
  ]
}