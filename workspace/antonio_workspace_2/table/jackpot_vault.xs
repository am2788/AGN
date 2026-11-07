// Rolling progressive grand jackpot prize vault
table jackpot_vault {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Jackpot vault name
    text name filters=trim
  
    // Current total prize pool in the rolling vault
    decimal current_vault_amount?
  
    // Percentage cut taken from wagers to fund jackpot (4% progressive vault from 8% total rake)
    decimal funding_cut_pct?=4
  
    // Active competitive season number
    int season?=1
  
    // Winning user who correctly predicted terminal cuts
    int? winner_user_id {
      table = "user"
    }
  
    // Jackpot lifecycle state
    enum status?=active {
      values = ["active", "claimed", "closed"]
    }
  
    // Progressive jackpot running total
    decimal running_total?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "season"}]}
    {type: "btree", field: [{name: "status"}]}
  ]
}