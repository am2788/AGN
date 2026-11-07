// Check First Strike category claim status without exposing sensitive user or payment PII
query first_strike verb=GET {
  api_group = "AGN"

  input {
    // First Strike category identifier (defaults to solo, or query solo/team)
    text category?=solo filters=trim
  }

  stack {
    // Look up First Strike category claim for the requested category
    db.query first_strike {
      where = $db.first_strike.category == $input.category
      return = {type: "single"}
    } as $claim
  
    // Look up Solo 1-of-1 claim
    db.query first_strike {
      where = $db.first_strike.category == "solo" || ($db.first_strike.category == "season_1" && $db.first_strike.claimed_by_team_id == null)
      return = {type: "single"}
    } as $solo_claim
  
    // Look up Team 1-of-1 claim
    db.query first_strike {
      where = $db.first_strike.category == "team" || ($db.first_strike.category == "season_1" && $db.first_strike.claimed_by_team_id != null)
      return = {type: "single"}
    } as $team_claim
  
    var $is_claimed {
      value = ($claim != null && $claim.claimed_at != null)
    }
  
    var $solo_claimed {
      value = ($solo_claim != null && $solo_claim.claimed_at != null)
    }
  
    var $team_claimed {
      value = ($team_claim != null && $team_claim.claimed_at != null)
    }
  }

  response = {
    category  : $input.category
    is_claimed: $is_claimed
    claimed_at: ($claim.claimed_at ?? null)
    solo      : ```
      {
        claimed   : $solo_claimed
        claimed_at: ($solo_claim.claimed_at ?? null)
      }
      ```
    team      : ```
      {
        claimed   : $team_claimed
        claimed_at: ($team_claim.claimed_at ?? null)
      }
      ```
  }
}