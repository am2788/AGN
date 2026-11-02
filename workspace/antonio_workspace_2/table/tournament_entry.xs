// Tournament registrations and bracket seed placements
table tournament_entry {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Tournament reference
    int tournament_id {
      table = "tournament"
    }
  
    // Registered solo competitor user
    int? user_id {
      table = "user"
    }
  
    // Registered team roster
    int? team_id {
      table = "team"
    }
  
    // Registration category
    enum entry_type {
      values = ["solo", "team"]
    }
  
    // Payment plan status for tournament entry
    enum payment_status?=pending {
      values = ["pending", "active_plan", "paid_in_full", "defaulted"]
    }
  
    // Assigned bracket seed number
    int? seed
  
    // Competitor status in the tournament bracket
    enum status?=registered {
      values = ["registered", "checked_in", "eliminated", "winner"]
    }
  
    // Active match live stream broadcast URL (Twitch, YouTube, Kick, or custom HLS)
    text? live_stream_url filters=trim
  
    // Whether participant is currently live streaming their tournament match
    bool is_live_streaming?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "tournament_id"}]}
    {type: "btree", field: [{name: "user_id"}]}
    {type: "btree", field: [{name: "team_id"}]}
    {type: "btree", field: [{name: "is_live_streaming"}]}
  ]
}