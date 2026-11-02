// Webhook for recurring weekly payment processing and default enforcement
query payments_webhook_installment verb=POST {
  api_group = "AGN"

  input {
    // Payment plan identifier
    int payment_plan_id {
      table = "payment_plan"
    }
  
    // Whether the card charge was successful
    bool payment_success
  
    // Failure reason if charge failed
    text? failure_reason filters=trim
  }

  stack {
    // Retrieve payment plan
    db.get payment_plan {
      field_name = "id"
      field_value = $input.payment_plan_id
    } as $plan
  
    precondition ($plan != null) {
      error_type = "notfound"
      error = "Payment plan not found."
    }
  
    conditional {
      if (!$input.payment_success) {
        // DEFAULT ENFORCEMENT: Execute immediate tournament DQ and lock profile
        db.edit payment_plan {
          field_name = "id"
          field_value = $plan.id
          data = {status: "past_due"}
        } as $updated_plan
      
        // Forfeit competitor from tournament
        db.edit tournament_entry {
          field_name = "id"
          field_value = $plan.tournament_entry_id
          data = {payment_status: "defaulted", status: "eliminated"}
        } as $defaulted_entry
      
        // Lock user profile and strip active rewards
        db.edit user {
          field_name = "id"
          field_value = $plan.user_id
          data = {is_wired_verified: false, calling_card: "locked"}
        } as $locked_user
      
        var $response_payload {
          value = {
            status      : "defaulted"
            disqualified: true
            action      : "Immediate tournament DQ executed and user profile locked."
            reason      : $input.failure_reason
          }
        }
      }
    
      else {
        // Increment weeks paid
        var $new_weeks_paid {
          value = $plan.weeks_paid + 1
        }
      
        var $new_status {
          value = "active"
        }
      
        var $new_payment_status {
          value = "active_plan"
        }
      
        // Check if all 8 weeks have been completed
        conditional {
          if ($new_weeks_paid >= $plan.total_weeks) {
            var.update $new_status {
              value = "completed"
            }
          
            var.update $new_payment_status {
              value = "paid_in_full"
            }
          }
        }
      
        // Calculate next billing date
        var $next_due {
          value = "now"
            |to_timestamp
            |add_secs_to_timestamp:604800
        }
      
        db.edit payment_plan {
          field_name = "id"
          field_value = $plan.id
          data = {
            weeks_paid   : $new_weeks_paid
            status       : $new_status
            next_due_date: $next_due
          }
        } as $updated_plan
      
        db.edit tournament_entry {
          field_name = "id"
          field_value = $plan.tournament_entry_id
          data = {payment_status: $new_payment_status}
        } as $updated_entry
      
        var $response_payload {
          value = {
            status       : $new_status
            weeks_paid   : $new_weeks_paid
            total_weeks  : $plan.total_weeks
            next_due_date: $next_due
          }
        }
      }
    }
  }

  response = $response_payload
}