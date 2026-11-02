// Gemini AI Referee: Lock official match winner, certify data hash, and release daily wagering payouts
query gemini_lock_result verb=POST {
  api_group = "AGN"

  input {
    // Resolved match lobby identifier
    int match_id {
      table = "match_lobby"
    }
  
    // Official winning competitor identifier
    int winning_player_id {
      table = "user"
    }
  
    // Official match score count string (e.g. 3-1, 16-12)
    text final_score_string filters=trim
  }

  stack {
    // Retrieve match lobby
    db.get match_lobby {
      field_name = "id"
      field_value = $input.match_id
    } as $lobby
  
    precondition ($lobby != null) {
      error_type = "notfound"
      error = "Match lobby not found."
    }
  
    // Verify winning player is a legitimate match participant
    precondition ($input.winning_player_id == $lobby.player_1_id || $input.winning_player_id == $lobby.player_2_id) {
      error_type = "inputerror"
      error = "Winning player must belong to this match lobby."
    }
  
    // Generate Gemini cryptographic verification hash
    var $hash_source {
      value = "GEMINI-CERT:" ~ ($lobby.id|to_text) ~ ":" ~ ($input.winning_player_id|to_text) ~ ":" ~ ($input.final_score_string) ~ ":" ~ ("now"|to_timestamp|to_text)
    }
  
    var $gemini_hash {
      value = $hash_source|sha256
    }
  
    // Lock official result into match_results_ledger permanently
    db.add match_results_ledger {
      data = {
        match_id                 : $lobby.id
        winning_player_id        : $input.winning_player_id
        final_score_string       : $input.final_score_string
        gemini_verification_hash : $gemini_hash
        wagering_payout_triggered: true
      }
    } as $locked_result
  
    // Update match lobby to completed
    db.edit match_lobby {
      field_name = "id"
      field_value = $lobby.id
      data = {lobby_status: "completed"}
    } as $completed_lobby
  
    // Update winner player stats and evaluate calling card milestones
    db.query player {
      where = $db.player.user_id == $input.winning_player_id
      return = {type: "single"}
    } as $winner_player
  
    conditional {
      if ($winner_player != null) {
        db.increment player {
          where = $db.player.id == $winner_player.id
          field_name = "match_wins"
          value = 1
        } as $inc_wins
      
        db.increment player {
          where = $db.player.id == $winner_player.id
          field_name = "matches_played"
          value = 1
        } as $inc_played
      
        function.run check_milestones {
          input = {player_id: $winner_player.id}
        } as $milestone_eval
      }
    }
  
    // Hook into Curaçao wagering engine: resolve daily match bets
    db.query wager {
      where = $db.wager.match_id == $lobby.id && $db.wager.status == "pending"
      return = {type: "list"}
    } as $pending_wagers
  
    // Settle winning bets
    foreach ($pending_wagers) {
      each as $item {
        conditional {
          if ($item.pick == ($input.winning_player_id|to_text)) {
            // Credit winnings to bettor's wallet
            db.increment wallet {
              where = $db.wallet.user_id == $item.user_id
              field_name = "balance"
              value = $item.potential_payout
            } as $credited_wallet
          
            db.edit wager {
              field_name = "id"
              field_value = $item.id
              data = {status: "won", paid_at: "now"|to_timestamp}
            } as $settled_wager
          }
        
          else {
            db.edit wager {
              field_name = "id"
              field_value = $item.id
              data = {status: "lost"}
            } as $lost_wager
          }
        }
      }
    }
  }

  response = {
    result                  : $locked_result
    gemini_verification_hash: $gemini_hash
    wagering_settlement     : ```
      {
        payouts_triggered: true,
        total_wagers_processed: ($pending_wagers|count)
      }
      ```
    message                 : "Match result certified and permanently locked by Gemini Referee. Wagering payouts released."
  }
}