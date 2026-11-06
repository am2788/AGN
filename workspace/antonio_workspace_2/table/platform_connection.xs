// External OAuth platform connections and credentials
table platform_connection {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Connected user account
    int user_id {
      table = "user"
    }
  
    // External connected platform provider
    enum provider {
      values = [
        "youtube"
        "soundcloud"
        "spotify"
        "twitch"
        "discord"
        "x"
        "meta"
      ]
    
    }
  
    // Encrypted OAuth access token
    text? encrypted_access_token filters=trim {
      sensitive = true
    }
  
    // Encrypted OAuth refresh token
    text? encrypted_refresh_token filters=trim {
      sensitive = true
    }
  
    // Granted OAuth permission scopes
    text? scopes filters=trim
  
    // Token expiration timestamp
    timestamp? expires_at
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {
      type : "btree|unique"
      field: [{name: "user_id"}, {name: "provider"}]
    }
    {type: "btree", field: [{name: "provider"}]}
  ]
}