// Gateway wager orders connecting Gateway selection, security check, and checkout tunnel
table gateway_wager_order {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Associated user account
    int user_id {
      table = "user"
    }
  
    // Selected Gateway tier (Pages 85-88)
    enum gateway_tier {
      values = [
        "silver_5"
        "gold_10"
        "tier_25"
        "platinum_50"
        "diamond_100"
        "legendary_250"
      ]
    
    }
  
    // Base Gateway wager payment amount ($5, $10, $25, $50, $100, $250)
    decimal gateway_amount
  
    // Target prize category
    enum prize_category {
      values = [
        "daily_match_winnings"
        "finals_qualifier_winner"
        "overall_tournament_jackpot"
      ]
    
    }
  
    // Standard prize multiplier (2X)
    int standard_multiplier?=2
  
    // Optional 2X Shield toggle (doubles wager, boosts prize to 3X)
    bool has_2x_shield?
  
    // Calculated eligible prize multiplier (2X standard, 3X with shield)
    int eligible_prize_multiplier?=2
  
    // Final total amount due at checkout (Pages 92-95)
    decimal total_amount_due
  
    // ID verification security-check state (neutral, amber, green)
    enum security_check_status?=neutral {
      values = ["neutral", "amber", "green"]
    }
  
    // Front scan image of government-issued ID
    text? id_front_image filters=trim
  
    // Back scan image of government-issued ID
    text? id_back_image filters=trim
  
    // Page 96 Final Gridlock confirmation flag
    bool is_final_gridlock_confirmed?
  
    // Checkout payment status
    enum payment_status?=pending {
      values = ["pending", "completed", "failed", "refunded"]
    }
  
    // Transaction receipt reference
    text? transaction_reference filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "user_id"}]}
    {type: "btree", field: [{name: "payment_status"}]}
    {type: "btree", field: [{name: "security_check_status"}]}
  ]
}