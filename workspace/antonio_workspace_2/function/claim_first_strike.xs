// Atomically claim First Strike award on the first verified tournament slot purchase
// Atomically claims First Strike award inside a database transaction for the first verified tournament participant, strictly excluding free spectators and admin accounts
function claim_first_strike {
  input {
    // Verified paying user ID
    int user_id
  
    // Optional participating competitive team ID
    int? team_id
  
    // Category identifier (e.g. solo, team, season_1)
    text category?=solo filters=trim
  
    // Verified payment transaction ID from cleared bracket slot purchase
    text payment_id filters=trim
  }

  stack {
    // Require verified cleared payment ID
    precondition ($input.payment_id != "") {
      error_type = "inputerror"
      error = "Cleared tournament slot payment verification required to claim First Strike."
    }
  
    // Retrieve buyer user record
    db.get user {
      field_name = "id"
      field_value = $input.user_id
    } as $buyer
  
    // Retrieve buyer profile to verify pathway
    db.query profile {
      where = $db.profile.user_id == $input.user_id
      return = {type: "single"}
    } as $buyer_profile
  
    // Exclude free spectators and admin/owner accounts
    var $is_spectator {
      value = (($buyer_profile != null && $buyer_profile.pathway == "spectator") || ($buyer != null && $buyer.pathway == "spectator"))
    }
  
    var $is_eligible {
      value = ($buyer != null && $buyer.role != "admin" && !$is_spectator)
    }
  
    // Strictly block free spectators and admin accounts from triggering or claiming First Strike entries
    precondition ($is_eligible) {
      error_type = "accessdenied"
      error = "Free spectators and admin accounts are strictly blocked from triggering or claiming First Strike entries."
    }
  
    var $claimed {
      value = false
    }
  
    // Determine category: singleton for solo vs team
    var $target_category {
      value = ($input.team_id != null ? "team" : ($input.category == "team" ? "team" : "solo"))
    }
  
    db.transaction {
      stack {
        // Check singleton claim status for category (solo or team)
        db.query first_strike {
          where = $db.first_strike.category == $target_category
          return = {type: "single"}
        } as $existing_claim
      
        conditional {
          if ($existing_claim == null) {
            db.add first_strike {
              data = {
                claimed_by_user_id: $input.user_id
                claimed_by_team_id: $input.team_id
                category          : $target_category
                claimed_at        : "now"
                payment_id        : $input.payment_id
              }
            } as $new_claim
          
            // Grant permanent First Strike badge to user
            db.edit user {
              field_name = "id"
              field_value = $input.user_id
              data = {has_first_strike: true}
            } as $updated_user
          
            // If claimed on behalf of a team, grant First Strike badge to team
            conditional {
              if ($input.team_id != null) {
                db.edit team {
                  field_name = "id"
                  field_value = $input.team_id
                  data = {has_first_strike: true}
                } as $updated_team
              }
            }
          
            // Unlock First Strike 1-of-1 Legendary Calling Card into user cosmetic inventory
            db.query calling_card {
              where = $db.calling_card.key == "first_strike"
              return = {type: "single"}
            } as $fs_card
          
            conditional {
              if ($fs_card != null) {
                db.query user_cosmetic {
                  where = $db.user_cosmetic.user_id == $input.user_id && $db.user_cosmetic.cosmetic_type == "calling_card" && $db.user_cosmetic.cosmetic_id == $fs_card.id
                  return = {type: "exists"}
                } as $has_fs_cosmetic
              
                conditional {
                  if (!$has_fs_cosmetic) {
                    db.add user_cosmetic {
                      data = {
                        user_id      : $input.user_id
                        cosmetic_type: "calling_card"
                        cosmetic_id  : $fs_card.id
                        unlocked_at  : "now"
                      }
                    } as $unlocked_fs_card
                  }
                }
              
                // Also populate user_cosmetics table
                db.query user_cosmetics {
                  where = $db.user_cosmetics.user_id == $input.user_id && $db.user_cosmetics.cosmetic_type == "card" && $db.user_cosmetics.asset_id == $fs_card.id && $db.user_cosmetics.tier == "legendary"
                  return = {type: "exists"}
                } as $has_fs_cosmetics
              
                conditional {
                  if (!$has_fs_cosmetics) {
                    db.add user_cosmetics {
                      data = {
                        user_id      : $input.user_id
                        cosmetic_type: "card"
                        asset_id     : $fs_card.id
                        tier         : "legendary"
                        unlocked_at  : "now"
                      }
                    } as $unlocked_fs_cosmetics
                  }
                }
              }
            }
          
            var.update $claimed {
              value = true
            }
          }
        }
      }
    }
  }

  response = {
    success : $claimed
    claimed : $claimed
    category: $target_category
  }
}