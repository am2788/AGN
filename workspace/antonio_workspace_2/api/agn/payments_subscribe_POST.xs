// Subscribe to an automated 8-week pre-tournament installment plan
query payments_subscribe verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Tournament entry to attach the payment plan to
    int tournament_entry_id {
      table = "tournament_entry"
    }
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
  
    // Calculate next due date (7 days from now)
    var $next_due {
      value = "now"
        |to_timestamp
        |add_secs_to_timestamp:604800
    }
  
    // Create payment plan record with 1st week paid
    db.add payment_plan {
      data = {
        user_id            : $auth.id
        tournament_entry_id: $entry.id
        weekly_amount      : $weekly_amount
        total_weeks        : 8
        weeks_paid         : 1
        next_due_date      : $next_due
        status             : "active"
      }
    } as $plan
  
    // Update entry status to active payment plan
    db.edit tournament_entry {
      field_name = "id"
      field_value = $entry.id
      data = {payment_status: "active_plan"}
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
    plan   : $plan
    entry  : $updated_entry
    message: "Week 1 installment confirmed. Automated 8-week payment plan active."
  }
}