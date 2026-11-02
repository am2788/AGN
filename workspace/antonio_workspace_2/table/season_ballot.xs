// Democratic ballots for voting on upcoming platform seasons
table season_ballot {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Ballot title
    text title filters=trim
  
    // Total cast votes across all options
    int total_votes?
  
    // Active voting status
    bool is_active?=true
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "is_active"}]}
  ]
}