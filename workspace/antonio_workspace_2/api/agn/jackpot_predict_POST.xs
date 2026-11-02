// Submit a Master Predictor bracket slip for the Classic Progressive Jackpot
query jackpot_predict verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Tournament being predicted
    int tournament_id {
      table = "tournament"
    }
  
    // Full predicted bracket outcomes JSON
    json predicted_bracket
  }

  stack {
    // Check if user already submitted a slip for this tournament
    db.query master_predictor_slip {
      where = $db.master_predictor_slip.tournament_id == $input.tournament_id && $db.master_predictor_slip.user_id == $auth.id
      return = {type: "exists"}
    } as $already_submitted
  
    precondition (!$already_submitted) {
      error_type = "inputerror"
      error = "You have already submitted a Master Predictor bracket slip for this tournament."
    }
  
    // Record predictor slip
    db.add master_predictor_slip {
      data = {
        user_id          : $auth.id
        tournament_id    : $input.tournament_id
        predicted_bracket: $input.predicted_bracket
        is_perfect       : true
      }
    } as $slip
  }

  response = {
    slip   : $slip
    message: "Master Predictor bracket slip locked in. Perfect score wins the Progressive Jackpot Vault."
  }
}