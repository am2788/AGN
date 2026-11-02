// User digital wagering wallets under Curaçao regulatory framework
table wallet {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Owner user account
    int user_id {
      table = "user"
    }
  
    // Available cleared cash balance
    decimal balance?
  
    // Locked balance in active wagers
    decimal locked_balance?
  
    // Currency code
    text currency?=USD filters=trim|upper
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "user_id"}]}
  ]
}