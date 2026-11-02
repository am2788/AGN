// Master predictor bracket slips submitted for the progressive jackpot
table master_predictor_slip {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Predicting bettor
    int user_id {
      table = "user"
    }
  
    // Associated tournament
    int tournament_id {
      table = "tournament"
    }
  
    // Full bracket terminal cut predictions in JSON format
    json predicted_bracket
  
    // Whether this sheet remains 100% perfect
    bool is_perfect?=true
  
    // Submission timestamp
    timestamp submitted_at?=now
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "user_id"}]}
    {type: "btree", field: [{name: "tournament_id"}]}
    {type: "btree", field: [{name: "is_perfect"}]}
  ]
}