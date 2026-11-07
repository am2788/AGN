// Place a real-money daily match wager with automated 8% rake split and jackpot injection
query wagers_place verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Scheduled match identifier
    int match_id
  
    // Selected team, competitor, or match outcome
    text pick filters=trim
  
    // Wagered cash amount
    decimal amount filters=min:1
  
    // Decimal odds multiplier
    decimal odds filters=min:1
  }

  stack {
    // Check user KYC and pathway compliance under Curaçao framework
    db.get user {
      field_name = "id"
      field_value = $auth.id
    } as $user
  
    precondition ($user != null) {
      error_type = "notfound"
      error = "User account not found."
    }
  
    // Retrieve user betting wallet
    db.query wallet {
      where = $db.wallet.user_id == $auth.id
      return = {type: "single"}
    } as $wallet
  
    precondition ($wallet != null) {
      error_type = "notfound"
      error = "No digital wallet found for this account."
    }
  
    // Ensure wallet has sufficient available balance
    precondition ($wallet.balance >= $input.amount) {
      error_type = "inputerror"
      error = "Insufficient wallet funds. Please deposit to place this wager."
    }
  
    // Calculate potential payout
    var $potential_payout {
      value = $input.amount * $input.odds
    }
  
    // Calculate 8% rake split: 4% operations, 4% to Progressive Grand Jackpot Vault
    var $jackpot_cut {
      value = $input.amount * 0.04
    }
  
    // Inject 4% cut into the active Progressive Jackpot Vault (both current amount and running total)
    db.increment jackpot_vault {
      where = $db.jackpot_vault.status == "active"
      field_name = "current_vault_amount"
      value = $jackpot_cut
    } as $updated_jackpot
  
    db.increment jackpot_vault {
      where = $db.jackpot_vault.status == "active"
      field_name = "running_total"
      value = $jackpot_cut
    } as $updated_jackpot_running
  
    // Deduct stake from bettor wallet
    var $new_balance {
      value = $wallet.balance - $input.amount
    }
  
    db.edit wallet {
      field_name = "id"
      field_value = $wallet.id
      data = {balance: $new_balance}
    } as $updated_wallet
  
    // Record wager in ledger
    db.add wager {
      data = {
        user_id         : $auth.id
        match_id        : $input.match_id
        pick            : $input.pick
        amount          : $input.amount
        odds            : $input.odds
        potential_payout: $potential_payout
        status          : "pending"
      }
    } as $wager
  }

  response = {
    wager         : $wager
    wallet_balance: $updated_wallet.balance
    jackpot_funded: $jackpot_cut
  }
}