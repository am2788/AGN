// Game candidates and vote tallies for a season ballot
table season_ballot_option {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Associated ballot
    int ballot_id {
      table = "season_ballot"
    }
  
    // Candidate game name
    text game_title filters=trim
  
    // Total votes cast for this game
    int vote_count?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "ballot_id"}]}
  ]
}