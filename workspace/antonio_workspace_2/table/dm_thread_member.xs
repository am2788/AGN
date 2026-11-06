// Direct message thread member participation
table dm_thread_member {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Thread conversation
    int thread_id {
      table = "dm_thread"
    }
  
    // Participating user
    int user_id {
      table = "user"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {
      type : "btree|unique"
      field: [{name: "thread_id"}, {name: "user_id"}]
    }
    {type: "btree", field: [{name: "user_id"}]}
  ]
}