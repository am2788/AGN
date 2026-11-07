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
  
    // Seed Season 1 vault if not yet created
    conditional {
      if ($vault == null) {
        db.add jackpot_vault {
          data = {
            name                : "Season 1 Grand Progressive Vault"
            current_vault_amount: 100000
            funding_cut_pct     : 4
            season              : 1
            status              : "active"
            running_total       : 100000
          }
        } as $seeded_vault
      
        var.update $vault {
          value = $seeded_vault
        }
      }
    }
  
    var $total {
      value = ($vault.running_total ?? ($vault.current_vault_amount ?? 0))
    }
  }

  response = {
    jackpot_total     : $total
    running_total     : $total
    season            : ($vault.season ?? 1)
    funding_cut_pct   : ($vault.funding_cut_pct ?? 4)
    operations_cut_pct: 4
    status            : ($vault.status ?? "active")
  }
}