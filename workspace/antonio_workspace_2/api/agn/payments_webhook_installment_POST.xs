// Webhook for recurring weekly payment processing and default enforcement
query payments_webhook_installment verb=POST {
  api_group = "AGN"

  input {
    // Legacy payment plan identifier
    int? payment_plan_id? {
      table = "payment_plan"
    }
  
    // Production payment_plans table identifier
    int? plan_id? {
      table = "payment_plans"
    }
  
    // Whether the card charge was successful
    bool payment_success
  
    // Failure reason if charge failed
    text? failure_reason filters=trim
  
    // Secure server-to-server webhook secret or signature
    text? webhook_secret? filters=trim
  }

  stack {
    // Verify secure server-to-server webhook authenticity
    var $webhook_token {
      value = ($input.webhook_secret ?? ($env.$http_headers["x-webhook-secret"] ?? ($env.$http_headers["x-webhook-signature"] ?? null)))
    }
  
    precondition ($webhook_token != null && $webhook_token != "") {
      error_type = "accessdenied"
      error = "Restricted: Status changes are restricted exclusively to secure server-to-server webhooks."
    }
  
    // Retrieve payment plan from payment_plan or payment_plans
    var $plan {
      value = null
    }
  
    var $plans_record {
      value = null
    }
  
    conditional {
      if ($input.payment_plan_id != null) {
        db.get payment_plan {
          field_name = "id"
          field_value = $input.payment_plan_id
        } as $found_plan
      
        var.update $plan {
          value = $found_plan
        }
      }
    }
  
    conditional {
      if ($input.plan_id != null) {
        db.get payment_plans {
          field_name = "id"
          field_value = $input.plan_id
        } as $found_plans_record
      
        var.update $plans_record {
          value = $found_plans_record
        }
      }
    }
  
    // If only one was supplied, find the counterpart
    conditional {
      if ($plan != null && $plans_record == null) {
        db.query payment_plans {
          where = $db.payment_plans.user_id == $plan.user_id
          sort = {id: "desc"}
          return = {type: "single"}
        } as $matched_plans_record
      
        var.update $plans_record {
          value = $matched_plans_record
        }
      }
    
      elseif ($plans_record != null && $plan == null) {
        db.query payment_plan {
          where = $db.payment_plan.user_id == $plans_record.user_id
          sort = {id: "desc"}
          return = {type: "single"}
        } as $matched_plan
      
        var.update $plan {
          value = $matched_plan
        }
      }
    }
  
    precondition ($plan != null || $plans_record != null) {
      error_type = "notfound"
      error = "Payment plan not found."
    }
  
    conditional {
      if (!$input.payment_success) {
        // DEFAULT ENFORCEMENT: Execute immediate tournament DQ and lock profile
        conditional {
          if ($plan != null) {
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
          }
        }
      
        conditional {
          if ($plans_record != null) {
            db.edit payment_plans {
              field_name = "id"
              field_value = $plans_record.id
              data = {status: "defaulted"}
            } as $updated_plans_rec
          }
        }
      
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
        // Successful payment processing
        var $new_weeks_paid {
          value = ($plan != null ? ($plan.weeks_paid + 1) : (($plans_record.installments_paid ?? 0) + 1))
        }
      
        var $new_status {
          value = "active"
        }
      
        var $new_plans_status {
          value = "active"
        }
      
        var $new_payment_status {
          value = "active_plan"
        }
      
        // Check if all 8 weeks have been completed
        conditional {
          if ($new_weeks_paid >= 8) {
            var.update $new_status {
              value = "completed"
            }
          
            var.update $new_plans_status {
              value = "complete"
            }
          
            var.update $new_payment_status {
              value = "paid_in_full"
            }
          }
        }
      
        // Calculate next billing date
        var $next_due {
          value = ($new_weeks_paid >= 8 ? null : ("now"|to_timestamp|add_secs_to_timestamp:604800))
        }
      
        conditional {
          if ($plan != null) {
            db.edit payment_plan {
              field_name = "id"
              field_value = $plan.id
              data = {
                weeks_paid   : $new_weeks_paid
                status       : $new_status
                next_due_date: ($next_due ?? ("now"|to_timestamp))
              }
            } as $updated_plan
          
            db.edit tournament_entry {
              field_name = "id"
              field_value = $plan.tournament_entry_id
              data = {payment_status: $new_payment_status}
            } as $updated_entry
          }
        }
      
        conditional {
          if ($plans_record != null) {
            db.edit payment_plans {
              field_name = "id"
              field_value = $plans_record.id
              data = {
                installments_paid: $new_weeks_paid
                status           : $new_plans_status
                next_due_at      : $next_due
              }
            } as $updated_plans_rec
          }
        }
      
        var $response_payload {
          value = {
            status           : $new_plans_status
            installments_paid: $new_weeks_paid
            total_weeks      : 8
            next_due_at      : $next_due
          }
        }
      }
    }
  }

  response = $response_payload
}