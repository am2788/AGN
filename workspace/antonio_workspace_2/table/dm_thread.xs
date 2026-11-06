// Direct message conversation threads
table dm_thread {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Whether this thread is a multi-user group chat
    bool is_group?
  
    // Optional custom name for group threads
    text? name filters=trim
  
    // Official AGN welcome thread identifier flag
    bool is_official_welcome?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "is_official_welcome"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}