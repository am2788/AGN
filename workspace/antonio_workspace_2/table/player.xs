// Player public competitive profiles and statistics
table player {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Associated user auth account
    int user_id {
      table = "user"
    }
  
    // Unique public username displayed on profiles
    text username filters=trim
  
    // Current player level
    int level?=1
  
    // Current experience points
    int xp?
  
    // Maximum experience points required for next level
    int xp_max?=1000
  
    // Competitive rank badge label (e.g. LEGENDARY)
    text rank_label?=ROOKIE filters=trim
  
    // Rank percentile among all players (e.g. 1.0 for top 1%)
    decimal rank_percentile?=100
  
    // Global leaderboard placement rank
    int global_rank?
  
    // Associated clan or team organization
    int? clan_id {
      table = "clan"
    }
  
    // Membership registration date
    date member_since?=now
  
    // Real-time online activity status
    bool is_online?
  
    // Total matches played
    int matches_played?
  
    // Total match wins
    int match_wins?
  
    // Total MVP awards won
    int mvp_awards?
  
    // Kill/Death or combat performance ratio
    decimal kd_ratio?
  
    // Total tournament brackets entered
    int tournaments_entered?
  
    // Total tournament championship titles won
    int tournaments_won?
  
    // Total tournament finals appearances
    int final_appearances?
  
    // Total career earnings in USD
    decimal total_earnings?
  
    // Active displayed calling card tier
    enum equipped_tier?=standard {
      values = ["standard", "premium"]
    }
  
    // Equipped standard calling card slot
    int? standard_card_id {
      table = "calling_card"
    }
  
    // Equipped premium calling card slot
    int? premium_card_id {
      table = "calling_card"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "username"}]}
    {type: "btree|unique", field: [{name: "user_id"}]}
    {type: "btree", field: [{name: "clan_id"}]}
    {type: "btree", field: [{name: "global_rank"}]}
  ]
}