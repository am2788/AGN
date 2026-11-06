// Season 1 Tournaments and lane specifications
table tournaments {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Tournament title
    text title filters=trim
  
    // Competition format
    enum format {
      values = ["solo_1v1", "team_5v5_plus1", "team_3v3"]
    }
  
    // Lane sequence order 1 to 6
    int lane_order
  
    // Maximum participant capacity
    int capacity?=6144
  
    // Active roster size per unit
    int roster_size?=1
  
    // Tournament start date
    date start_date?="2026-11-23"
  
    // Total base prize pool in USD
    int prize_base
  
    // Guaranteed prize per player
    int prize_per_player?=100000
  
    // Full upfront payment price in USD
    int? plan_full_price
  
    // Weekly installment payment price in USD
    int? plan_weekly_price
  
    // Total installment weeks
    int? plan_weeks?=8
  
    // Operational tournament status (admin-only)
    enum status?=open {
      values = ["open", "paused", "closed"]
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "lane_order"}]}
    {type: "btree", field: [{name: "status"}]}
    {type: "btree", field: [{name: "format"}]}
  ]
}