// Cast a democratic vote on the Season 2 title ballot
query ballot_vote verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Ballot identifier
    int ballot_id {
      table = "season_ballot"
    }
  
    // Selected game candidate option identifier
    int option_id {
      table = "season_ballot_option"
    }
  }

  stack {
    // Verify ballot is active
    db.get season_ballot {
      field_name = "id"
      field_value = $input.ballot_id
    } as $ballot
  
    precondition ($ballot != null && $ballot.is_active) {
      error_type = "inputerror"
      error = "This ballot is no longer active."
    }
  
    // Check if user has already voted on this ballot
    db.query season_ballot_vote {
      where = $db.season_ballot_vote.ballot_id == $input.ballot_id && $db.season_ballot_vote.user_id == $auth.id
      return = {type: "exists"}
    } as $has_voted
  
    precondition (!$has_voted) {
      error_type = "inputerror"
      error = "You have already cast your vote on this ballot."
    }
  
    // Record the user vote
    db.add season_ballot_vote {
      data = {
        ballot_id: $input.ballot_id
        option_id: $input.option_id
        user_id  : $auth.id
      }
    } as $vote
  
    // Atomically increment vote count on chosen option
    db.increment season_ballot_option {
      where = $db.season_ballot_option.id == $input.option_id
      field_name = "vote_count"
      value = 1
    } as $updated_option
  
    // Atomically increment total ballot votes
    db.increment season_ballot {
      where = $db.season_ballot.id == $input.ballot_id
      field_name = "total_votes"
      value = 1
    } as $updated_ballot
  }

  response = {
    success: true
    message: "Vote cast successfully. Thank you for shaping Season 2."
  }
}