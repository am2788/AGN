// Ballots votes enforcing 1 vote per account per season
table ballot_votes {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Voter account
    int user_id {
      table = "user"
    }
  
    // Competitive season number
    int season?=2
  
    // Candidate option chosen
    int option_id {
      table = "ballot_options"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {
      type : "btree|unique"
      field: [{name: "user_id"}, {name: "season"}]
    }
    {type: "btree", field: [{name: "option_id"}]}
  ]
}