// Check First Strike category claim status without exposing sensitive user or payment PII
query first_strike verb=GET {
  api_group = "AGN"

  input {
    // First Strike category identifier
    text category?=season_1 filters=trim
  }

  stack {
    // Look up First Strike category claim
    db.query first_strike {
      where = $db.first_strike.category == $input.category
      return = {type: "single"}
    } as $claim
  
    var $is_claimed {
      value = ($claim != null && $claim.claimed_at != null)
    }
  }

  response = {
    category  : $input.category
    is_claimed: $is_claimed
    claimed_at: ($claim.claimed_at ?? null)
  }
}