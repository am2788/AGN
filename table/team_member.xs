// Members and roles within a 6-player roster
table team_member {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Associated team
    int team_id {
      table = "team"
    }
  
    // Member user reference
    int user_id {
      table = "user"
    }
  
    // Member role within the roster
    enum role?=member {
      values = ["captain", "member", "substitute"]
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "team_id"}]}
    {type: "btree", field: [{name: "user_id"}]}
  ]
}