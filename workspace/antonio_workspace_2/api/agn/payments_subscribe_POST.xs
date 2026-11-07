// Subscribe to an automated 8-week pre-tournament installment plan or full payment
query payments_subscribe verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Tournament entry to attach the payment plan to
    int tournament_entry_id {
      table = "tournament_entry"
    }
  
    // Payment plan type: full upfront or weekly installments
    text plan_type?=weekly
  }

  stack {
    // Retrieve tournament entry
    db.get tournament_entry {
      field_name = "id"
      field_value = $input.tournament_entry_id
    } as $entry
  
    precondition ($entry != null) {
      error_type = "notfound"
      error = "Tournament entry not found."
    }
  
    // Retrieve tournament details for installment pricing
    db.get tournament {
      field_name = "id"
      field_value = $entry.tournament_id
    } as $tournament
  
    // Determine weekly installment amount based on tournament format ($50 solo, $275 team)
    var $weekly_amount {
      value = 50
    }
  
    conditional {
      if ($tournament != null && $tournament.weekly_installment > 0) {
        var.update $weekly_amount {
          value = $tournament.weekly_installment
        }
      }
    
      elseif ($entry.entry_type == "team") {
        var.update $weekly_amount {
          value = 275
        }
      }
    }
  
    var $is_full_plan {
      value = ($input.plan_type == "full")
    }
  
    // Calculate next due date (7 days from now for weekly, null for full)
    var $next_due {
      value = null
    }
  
    var $plan_status {
      value = "active"
    }
  
    var $installments {
      value = 1
    }
  
    var $entry_payment_status {
      value = "active_plan"
    }
  
    conditional {
      if ($is_full_plan) {
        var.update $plan_status {
          value = "complete"
        }
      
        var.update $installments {
          value = 8
        }
      
        var.update $entry_payment_status {
          value = "paid_in_full"
        }
      }
    
      else {
        var.update $next_due {
          value = "now"
            |to_timestamp
            |add_secs_to_timestamp:604800
        }
      }
    }
  
    // Create payment plan record in legacy payment_plan table
    db.add payment_plan {
      data = {
        user_id            : $auth.id
        tournament_entry_id: $entry.id
        weekly_amount      : $weekly_amount
        total_weeks        : 8
        weeks_paid         : $installments
        next_due_date      : ($next_due ?? ("now"|to_timestamp))
        status             : ($is_full_plan ? "completed" : "active")
      }
    } as $plan
  
    // Create record in production payment_plans table
    db.add payment_plans {
      data = {
        user_id          : $auth.id
        tournament_id    : $entry.tournament_id
        plan_type        : ($is_full_plan ? "full" : "weekly")
        installments_paid: $installments
        next_due_at      : $next_due
        status           : $plan_status
      }
    } as $subscription_ledger
  
    // Update entry status to active payment plan or paid in full
    db.edit tournament_entry {
      field_name = "id"
      field_value = $entry.id
      data = {payment_status: $entry_payment_status}
    } as $updated_entry
  
    // Atomically claim First Strike award for first verified tournament participant
    function.run claim_first_strike {
      input = {
        user_id   : $auth.id
        team_id   : $entry.team_id
        category  : "season_1"
        payment_id: ("PLAN-" ~ ($plan.id|to_text) ~ "-" ~ ($entry.id|to_text))
      }
    } as $first_strike_claim
  }

  response = {
    plan               : $plan
    payment_plans_entry: $subscription_ledger
    entry              : $updated_entry
    message            : ($is_full_plan ? "Paid in full. Entry confirmed." : "Week 1 installment confirmed. Automated 8-week payment plan active.")
  }
}