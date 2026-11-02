// Tournaments and bracket competitions
table tournament {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Associated game
    int game_id {
      table = "game"
    }
  
    // Tournament title
    text name filters=trim
  
    // Tournament competition format: solo, 6-player team, or 4v4 zombies
    enum format {
      values = ["solo", "team_6", "zombies_4v4", "team"]
    }
  
    // Standard player capacity (fixed at 6144)
    int max_participants?=6144
  
    // Base guaranteed prize pool
    decimal base_prize_pool
  
    // Total entry fee for tournament
    decimal entry_fee_total
  
    // Weekly installment fee amount
    decimal weekly_installment
  
    // Total weeks for the payment plan
    int installment_weeks?=8
  
    // Scheduled tournament kickoff date and time
    timestamp starts_at
  
    // Current tournament lifecycle state
    enum status?=registration_open {
      values = ["registration_open", "in_progress", "completed", "cancelled"]
    }
  
    // Roster size per team unit (1 for solo, 6 for team_6, 4 for zombies_4v4)
    int roster_size?=1
  
    // Total calculated team capacity (6144 for solo, 1024 for team_6, 1536 for zombies_4v4)
    int max_teams?=6144
  
    // Operating cadence duration in days (standard 6-day schedule)
    int schedule_days?=6
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "game_id"}]}
    {type: "btree", field: [{name: "status"}]}
    {type: "btree", field: [{name: "format"}]}
  ]
}