// Step 3: Checkout Tunnel (Pages 92-95) & Page 96 Final Gridlock confirmation
query gateway_checkout verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Gateway order identifier
    int order_id {
      table = "gateway_wager_order"
    }
  
    // Cardholder full name
    text cardholder_name filters=trim
  
    // Last 4 digits of payment card for receipt
    text card_last4 filters=trim
  
    // Associated tournament identifier (optional if entering tournament directly)
    int? tournament_id {
      table = "tournament"
    }
  }

  stack {
    // Retrieve the Gateway wager order
    db.get gateway_wager_order {
      field_name = "id"
      field_value = $input.order_id
    } as $order
  
    precondition ($order != null && $order.user_id == $auth.id) {
      error_type = "notfound"
      error = "Gateway order not found or unauthorized."
    }
  
    // Ensure security ID check passed before checkout is allowed
    precondition ($order.security_check_status == "green") {
      error_type = "accessdenied"
      error = "Security check ID verification must be passed before completing checkout."
    }
  
    // Generate unique transaction reference
    var $txn_ref {
      value = "AGN-TXN-" ~ (""|uuid|substr:0:8|to_upper)
    }
  
    // Finalize order payment and mark Page 96 Final Gridlock confirmed
    db.edit gateway_wager_order {
      field_name = "id"
      field_value = $order.id
      data = {
        payment_status             : "completed"
        is_final_gridlock_confirmed: true
        transaction_reference      : $txn_ref
      }
    } as $completed_order
  
    // Credit user's wallet with the initial gateway wager stake
    db.increment wallet {
      where = $db.wallet.user_id == $auth.id
      field_name = "balance"
      value = $order.gateway_amount
    } as $updated_wallet
  
    // If a tournament is associated, record entry
    var $created_entry {
      value = null
    }
  
    conditional {
      if ($input.tournament_id != null) {
        db.add tournament_entry {
          data = {
            tournament_id : $input.tournament_id
            user_id       : $auth.id
            entry_type    : "solo"
            payment_status: "paid_in_full"
            status        : "registered"
          }
        } as $entry
      
        var.update $created_entry {
          value = $entry
        }
      
        // Atomically claim First Strike calling card for first verified tournament participant
        function.run claim_first_strike {
          input = {
            user_id   : $auth.id
            category  : "season_1"
            payment_id: $txn_ref
          }
        } as $first_strike_claim
      }
    }
  }

  response = {
    success            : true
    page_state         : "Page 96: Final Gridlock"
    order              : $completed_order
    tournament_entry   : $created_entry
    transaction_receipt: ```
      {
        transaction_id: $txn_ref,
        cardholder: $input.cardholder_name,
        card_last4: $input.card_last4,
        gateway_tier: $completed_order.gateway_tier,
        gateway_amount: $completed_order.gateway_amount,
        prize_category: $completed_order.prize_category,
        has_2x_shield: $completed_order.has_2x_shield,
        eligible_prize_multiplier: $completed_order.eligible_prize_multiplier,
        total_charged: $completed_order.total_amount_due
      }
      ```
    cinematics         : ```
      {
        gridlock_motion_clip: "locked off 2718",
        welcome_cinematic: "video cinematic 4375"
      }
      ```
    next_destination   : "Page 42 Overchat Dashboard"
  }
}