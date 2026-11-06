// Jackpot vault audit ledger rows
table jackpot_ledger {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Linked wager identifier
    int? wager_id
  
    // Wager contribution amount
    decimal amount
  
    // Progressive pot total at transaction time
    decimal pot_total
  
    // Calculated 80% winner payout
    decimal winner_payout_80pct
  
    // Calculated 20% jackpot vault allocation
    decimal vault_allocation_20pct
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "wager_id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}