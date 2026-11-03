// Live match scores and ticker status feed
table live_match_tickers {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Match identifier
    int match_id
  
    // Tournament identifier
    int tournament_id
  
    // Title of the game being played
    text game_title
  
    // Team 1 current score
    int team_one_score?
  
    // Team 2 current score
    int team_two_score?
  
    // Current match progression status
    text match_status?=pre_match
  
    // Headline news or update text for the ticker banner
    text ticker_headline?
  
    // Timestamp when the score or status was last updated
    timestamp last_updated?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "match_id"}]}
    {type: "btree", field: [{name: "match_status"}]}
  ]
}