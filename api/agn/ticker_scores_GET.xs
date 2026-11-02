// ESPN-style live score ticker with 8-minute interval and 4-minute broadcast duration
query ticker_scores verb=GET {
  api_group = "AGN"

  input {
  }

  stack {
    // Current epoch seconds to compute 8-minute cycle with 4-minute active duration
    var $epoch_seconds {
      value = "now"|to_timestamp|to_seconds
    }
  
    // 8-minute cycle = 480 seconds
    var $cycle_position {
      value = $epoch_seconds % 480
    }
  
    var $is_active {
      value = false
    }
  
    var $time_left {
      value = 0
    }
  
    var $time_until_next {
      value = 0
    }
  
    // Active during the first 240 seconds (4 minutes) of every 480-second window
    conditional {
      if ($cycle_position < 240) {
        var.update $is_active {
          value = true
        }
      
        var.update $time_left {
          value = 240 - $cycle_position
        }
      }
    
      else {
        var.update $time_until_next {
          value = 480 - $cycle_position
        }
      }
    }
  
    // Retrieve recent certified match results
    db.query match_results_ledger {
      join = {
        lobby : {
          table: "match_lobby"
          where: $db.match_results_ledger.match_id == $db.match_lobby.id
        }
        winner: {
          table: "user"
          where: $db.match_results_ledger.winning_player_id == $db.user.id
        }
      }
    
      sort = {created_at: "desc"}
      eval = {
        winner_name  : $db.user.name
        tournament_id: $db.match_lobby.tournament_id
      }
    
      return = {type: "list", paging: {page: 1, per_page: 10}}
    } as $recent_results
  
    // Retrieve active matches in progress
    db.query match_lobby {
      join = {
        p1: {
          table: "user"
          where: $db.match_lobby.player_1_id == $db.user.id
        }
      }
    
      where = $db.match_lobby.lobby_status == "active_match"
      sort = {id: "desc"}
      eval = {p1_name: $db.user.name}
      return = {type: "list", paging: {page: 1, per_page: 5}}
    } as $live_matches
  }

  response = {
    ticker_timing: ```
      {
        is_ticker_active: $is_active,
        active_seconds_remaining: $time_left,
        seconds_until_next_display: $time_until_next,
        cycle_definition: "Active for 4 minutes every 8-minute window"
      }
      ```
    ticker_feed  : ```
      {
        recent_certified_results: $recent_results,
        active_live_lobbies: $live_matches
      }
      ```
  }
}