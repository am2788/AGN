// Democratic ballot options for Season title votes
table ballot_options {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Competitive season number (Season 2 default)
    int season?=2
  
    // Candidate game title
    text title filters=trim
  
    // Total votes cast for this candidate
    int vote_count?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "season"}]}
  ]
}