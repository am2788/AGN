// Cast a democratic vote on the Season 2 title ballot with hard server-time cutoff
query ballot_vote verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Ballot identifier
    int? ballot_id? {
      table = "season_ballot"
    }
  
    // Selected game candidate option identifier
    int option_id
  
    // Competitive season number
    int season?=2
  }

  stack {
    // Enforce hard server-time cutoff at 2026-12-21T00:00:00Z (timestamp: 1797811200000 ms)
    var $cutoff_timestamp {
      value = 1797811200000
    }
  
    precondition (now < $cutoff_timestamp) {
      error_type = "inputerror"
      error = "Voting for Season 2 closed on 2026-12-21T00:00:00Z."
    }
  
    // Check if user has already voted for this season
    db.query ballot_votes {
      where = $db.ballot_votes.user_id == $auth.id && $db.ballot_votes.season == $input.season
      return = {type: "exists"}
    } as $has_season_voted
  
    precondition (!$has_season_voted) {
      error_type = "inputerror"
      error = "You have already cast your vote for this season."
    }
  
    // Record vote in season ballot_votes table
    db.add ballot_votes {
      data = {
        user_id  : $auth.id
        season   : $input.season
        option_id: $input.option_id
      }
    } as $recorded_vote
  
    // Atomically increment vote count on chosen ballot option
    db.increment ballot_options {
      where = $db.ballot_options.id == $input.option_id
      field_name = "vote_count"
      value = 1
    } as $updated_opt
  
    // Maintain legacy tables if ballot_id provided
    conditional {
      if ($input.ballot_id != null) {
        db.add season_ballot_vote {
          data = {
            ballot_id: $input.ballot_id
            option_id: $input.option_id
            user_id  : $auth.id
          }
        } as $legacy_vote
      
        db.increment season_ballot_option {
          where = $db.season_ballot_option.id == $input.option_id
          field_name = "vote_count"
          value = 1
        } as $legacy_opt
      }
    }
  }

  response = {
    success: true
    message: "Vote cast successfully. Thank you for shaping Season 2."
  }
}