// Live score ticker for active and specific tournament matches
query ticker_scores verb=GET {
  api_group = "AGN"

  input {
    // Optional match identifier to query a specific match
    int? match_id?
  }

  stack {
    // Initialize results collection
    var $match_scores {
      value = []
    }
  
    // Branch query based on whether match_id input is provided
    conditional {
      if ($input.match_id != null) {
        // Query live match tickers for the specified match ID
        db.query live_match_tickers {
          where = $db.live_match_tickers.match_id == $input.match_id
          sort = {id: "desc"}
          return = {type: "list"}
        } as $match_scores
      }
    
      else {
        // Query all active live matches in progress
        db.query live_match_tickers {
          where = $db.live_match_tickers.match_status == "live_in_progress"
          sort = {id: "desc"}
          return = {type: "list"}
        } as $match_scores
      }
    }
  }

  response = $match_scores
}