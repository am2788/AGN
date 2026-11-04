// Get public player profile by username
query "player/{id}" verb=GET {
  api_group = "AGN"

  input {
    // Player username
    text id filters=trim
  }

  stack {
    // Look up player by username
    db.query player {
      where = $db.player.username == $input.id
      return = {type: "single"}
    } as $player
  
    precondition ($player != null) {
      error_type = "notfound"
      error = "Player not found."
    }
  
    // Retrieve clan if assigned
    var $clan_name {
      value = null
    }
  
    conditional {
      if ($player.clan_id != null) {
        db.get clan {
          field_name = "id"
          field_value = $player.clan_id
        } as $clan
      
        conditional {
          if ($clan != null) {
            var.update $clan_name {
              value = $clan.name
            }
          }
        }
      }
    }
  
    // Retrieve player achievements
    db.query player_achievement {
      join = {
        achievement: {
          table: "achievement"
          where: $db.player_achievement.achievement_id == $db.achievement.id
        }
      }
    
      where = $db.player_achievement.player_id == $player.id && $db.player_achievement.achieved == true
      eval = {
        key  : $db.achievement.key
        label: $db.achievement.label
        icon : $db.achievement.icon
      }
    
      return = {type: "list"}
    } as $achievements_list
  
    var $achievements {
      value = ```
        $achievements_list|map:{
                key: $$.key,
                label: $$.label,
                icon: $$.icon,
                achieved: true
              }
        ```
    }
  
    // Retrieve standard card
    var $standard_slot {
      value = {unlocked: false, image_url: null}
    }
  
    conditional {
      if ($player.standard_card_id != null) {
        db.get calling_card {
          field_name = "id"
          field_value = $player.standard_card_id
        } as $std_card
      
        conditional {
          if ($std_card != null) {
            var.update $standard_slot {
              value = {unlocked: true, image_url: $std_card.image_url}
            }
          }
        }
      }
    }
  
    // Retrieve premium card
    var $premium_slot {
      value = {unlocked: false, video_url: null}
    }
  
    conditional {
      if ($player.premium_card_id != null) {
        db.get calling_card {
          field_name = "id"
          field_value = $player.premium_card_id
        } as $prem_card
      
        conditional {
          if ($prem_card != null) {
            var.update $premium_slot {
              value = {unlocked: true, video_url: $prem_card.video_url}
            }
          }
        }
      }
    }
  
    // Compute win rate
    var $win_rate {
      value = 0
    }
  
    conditional {
      if ($player.matches_played > 0) {
        var.update $win_rate {
          value = ($player.match_wins / $player.matches_played)|round:2
        }
      }
    }
  }

  response = {
    id               : $player.id
    username         : $player.username
    level            : $player.level
    rank_label       : $player.rank_label
    rank_percentile  : $player.rank_percentile
    global_rank      : $player.global_rank
    xp               : $player.xp
    xp_max           : $player.xp_max
    clan_name        : $clan_name
    member_since     : $player.member_since
    is_online        : $player.is_online
    stats            : ```
      {
        matches_played: $player.matches_played,
        match_wins: $player.match_wins,
        win_rate: $win_rate,
        kd_ratio: $player.kd_ratio,
        mvp_awards: $player.mvp_awards
      }
      ```
    tournament_record: ```
      {
        entered: $player.tournaments_entered,
        won: $player.tournaments_won,
        final_appearances: $player.final_appearances,
        total_earnings: $player.total_earnings
      }
      ```
    achievements     : $achievements
    calling_cards    : ```
      {
        equipped_tier: $player.equipped_tier,
        standard: $standard_slot,
        premium: $premium_slot
      }
      ```
  }
}