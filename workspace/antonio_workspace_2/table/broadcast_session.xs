// Live broadcast telemetry, matches, and overlay controls
table broadcast_session {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Associated tournament
    int tournament_id {
      table = "tournament"
    }
  
    // Match identifier
    int match_id
  
    // Live stream video playback URL
    text stream_url filters=trim
  
    // Score for Team / Competitor A
    int score_a?
  
    // Score for Team / Competitor B
    int score_b?
  
    // Broadcast state
    enum status?=pre_show {
      values = ["pre_show", "live", "halftime", "post_match", "rerun"]
    }
  
    // Blue dashboard live commentator / operator notes
    text? commentator_notes
  
    // Red spectator HUD scrolling ticker text
    text? ticker_announcement
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "tournament_id"}]}
    {type: "btree", field: [{name: "status"}]}
  ]
}