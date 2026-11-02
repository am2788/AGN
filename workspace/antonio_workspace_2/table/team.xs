// Competitive 6-player team rosters
table team {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Team display name
    text name filters=trim
  
    // Short clan/team tag
    text tag filters=trim|upper
  
    // Team captain user reference
    int captain_user_id {
      table = "user"
    }
  
    // Secret invite code to join roster
    text invite_code filters=trim
  
    // Whether this team earned the permanent First Strike motion calling card
    bool has_first_strike?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "invite_code"}]}
    {type: "btree", field: [{name: "captain_user_id"}]}
  ]
}