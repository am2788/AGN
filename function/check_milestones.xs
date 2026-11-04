// Automatically evaluate player milestones and unlock calling cards
function check_milestones {
  input {
    // Player identifier to evaluate
    int player_id {
      table = "player"
    }
  }

  stack {
    // Retrieve player record
    db.get player {
      field_name = "id"
      field_value = $input.player_id
    } as $player
  
    conditional {
      if ($player != null) {
        // Query all milestone rules
        db.query milestone {
          return = {type: "list"}
        } as $milestones
      
        // Iterate through each milestone rule
        foreach ($milestones) {
          each as $m {
            // Determine player's metric value
            var $val {
              value = 0
            }
          
            conditional {
              if ($m.metric == "matches_played") {
                var.update $val {
                  value = $player.matches_played
                }
              }
            
              elseif ($m.metric == "match_wins") {
                var.update $val {
                  value = $player.match_wins
                }
              }
            
              elseif ($m.metric == "tournaments_won") {
                var.update $val {
                  value = $player.tournaments_won
                }
              }
            
              elseif ($m.metric == "level") {
                var.update $val {
                  value = $player.level
                }
              }
            
              elseif ($m.metric == "mvp_awards") {
                var.update $val {
                  value = $player.mvp_awards
                }
              }
            }
          
            // If player meets or exceeds threshold, check if already unlocked
            conditional {
              if ($val >= $m.threshold) {
                db.query player_calling_card {
                  where = $db.player_calling_card.player_id == $player.id && $db.player_calling_card.calling_card_id == $m.reward_card_id
                  return = {type: "exists"}
                } as $already_unlocked
              
                conditional {
                  if (!$already_unlocked) {
                    // Unlock card into inventory
                    db.add player_calling_card {
                      data = {
                        player_id      : $player.id
                        calling_card_id: $m.reward_card_id
                        unlocked_at    : "now"
                      }
                    } as $unlocked_row
                  
                    // Retrieve card tier details
                    db.get calling_card {
                      field_name = "id"
                      field_value = $m.reward_card_id
                    } as $reward_card
                  
                    // If matching card slot is currently empty, auto-equip
                    conditional {
                      if ($reward_card != null && $reward_card.tier == "standard" && $player.standard_card_id == null) {
                        db.edit player {
                          field_name = "id"
                          field_value = $player.id
                          data = {standard_card_id: $reward_card.id}
                        } as $player
                      }
                    
                      elseif ($reward_card != null && $reward_card.tier == "premium" && $player.premium_card_id == null) {
                        db.edit player {
                          field_name = "id"
                          field_value = $player.id
                          data = {premium_card_id: $reward_card.id}
                        } as $player
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  response = {evaluated: true, player_id: $input.player_id}
}