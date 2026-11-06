// Platform moderation bans and account restrictions
table bans {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Banned user account
    int user_id {
      table = "user"
    }
  
    // Violation reason for administrative ban
    text reason filters=trim
  
    // Admin user account issuing the ban
    int? banned_by_admin_id {
      table = "user"
    }
  
    // Whether ban is currently active
    bool active?=true
  
    // Expiration timestamp for temporary bans (null = permanent)
    timestamp? expires_at
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "user_id"}]}
    {type: "btree", field: [{name: "active"}]}
    {type: "btree", field: [{name: "expires_at"}]}
  ]
}