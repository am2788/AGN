// Individual user votes cast on season ballots
table season_ballot_vote {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Associated ballot
    int ballot_id {
      table = "season_ballot"
    }
  
    // Chosen ballot option
    int option_id {
      table = "season_ballot_option"
    }
  
    // Voter user account
    int user_id {
      table = "user"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "ballot_id"}]}
    {type: "btree", field: [{name: "user_id"}]}
  ]
}