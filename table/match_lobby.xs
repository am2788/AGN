// Active match lobbies monitored by Gemini AI Referee
table match_lobby {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Tournament bracket reference
    int tournament_id {
      table = "tournament"
    }
  
    // Player or team 1 reference
    int player_1_id {
      table = "user"
    }
  
    // Player or team 2 reference
    int player_2_id {
      table = "user"
    }
  
    // Active lobby state monitored by Gemini
    enum lobby_status?=waiting_for_check_in {
      values = [
        "waiting_for_check_in"
        "active_match"
        "completed"
        "disqualified"
      ]
    
    }
  
    // 15-minute countdown deadline for player check-in
    timestamp check_in_deadline
  
    // Regional edge server routing the lobby
    text server_node_location filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "tournament_id"}]}
    {type: "btree", field: [{name: "lobby_status"}]}
    {type: "btree", field: [{name: "check_in_deadline"}]}
  ]
}