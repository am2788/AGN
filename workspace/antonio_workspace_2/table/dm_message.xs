// Direct messages within personal and group threads
table dm_message {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Containing conversation thread
    int thread_id {
      table = "dm_thread"
    }
  
    // Message sender user account
    int sender_id {
      table = "user"
    }
  
    // Message body content
    text body filters=trim
  
    // Held for safety or moderation review
    bool is_held?
  
    // Safety filter or automated moderation trigger explanation
    text? hold_reason filters=trim
  
    // Official AGN welcome quote marker
    bool is_official_welcome?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "thread_id"}]}
    {type: "btree", field: [{name: "sender_id"}]}
    {type: "btree", field: [{name: "is_held"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}