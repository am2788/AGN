// Retrieve the current progressive jackpot vault total (read-only, total only)
query jackpot verb=GET {
  api_group = "AGN"

  input {
  }

  stack {
    // Retrieve active jackpot vault record
    db.query jackpot_vault {
      where = $db.jackpot_vault.status == "active"
      sort = {id: "desc"}
      return = {type: "single"}
    } as $vault
  
    var $total {
      value = ($vault.running_total ?? ($vault.current_vault_amount ?? 0))
    }
  }

  response = {jackpot_total: $total}
}