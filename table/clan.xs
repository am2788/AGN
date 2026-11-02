// Player competitive clans and organizations
table clan {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Clan display name
    text name filters=trim
  
    // Short clan tag
    text tag filters=trim|upper
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "name"}]}
  ]
}