// Step 1: Gateway Selection (Pages 85-88) with optional 2X Shield calculation
query gateway_select verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Gateway tier: silver_5, gold_10, tier_25, platinum_50, diamond_100, legendary_250
    text gateway_tier
  
    // Selected prize category
    text prize_category
  
    // Optional 2X Shield selection (doubles wager, triples eligible prize)
    bool has_2x_shield?
  }

  stack {
    // Map Gateway tier to base payment amount
    var $gateway_amount {
      value = 5
    }
  
    conditional {
      if ($input.gateway_tier == "gold_10") {
        var.update $gateway_amount {
          value = 10
        }
      }
    
      elseif ($input.gateway_tier == "tier_25") {
        var.update $gateway_amount {
          value = 25
        }
      }
    
      elseif ($input.gateway_tier == "platinum_50") {
        var.update $gateway_amount {
          value = 50
        }
      }
    
      elseif ($input.gateway_tier == "diamond_100") {
        var.update $gateway_amount {
          value = 100
        }
      }
    
      elseif ($input.gateway_tier == "legendary_250") {
        var.update $gateway_amount {
          value = 250
        }
      }
    }
  
    // Calculate prize multiplier and total amount due based on optional 2X Shield
    var $eligible_multiplier {
      value = 2
    }
  
    var $total_due {
      value = $gateway_amount
    }
  
    conditional {
      if ($input.has_2x_shield) {
        var.update $eligible_multiplier {
          value = 3
        }
      
        var.update $total_due {
          value = $gateway_amount * 2
        }
      }
    }
  
    // Create pending Gateway wager order in neutral security-check state
    db.add gateway_wager_order {
      data = {
        user_id                  : $auth.id
        gateway_tier             : $input.gateway_tier
        gateway_amount           : $gateway_amount
        prize_category           : $input.prize_category
        standard_multiplier      : 2
        has_2x_shield            : $input.has_2x_shield
        eligible_prize_multiplier: $eligible_multiplier
        total_amount_due         : $total_due
        security_check_status    : "neutral"
        payment_status           : "pending"
      }
    } as $order
  }

  response = {
    order      : $order
    next_step  : "security_check"
    ui_guidance: "Proceed to Step 2: ID Verification Security Check (Neutral State)"
  }
}