// Equip cosmetic item (emblem, medal, card) after verifying user ownership
query "card/equip" verb=PATCH {
  api_group = "AGN"
  auth = "user"

  input {
    // Type of cosmetic: emblem, medal, or card
    text cosmetic_type filters=trim|lower
  
    // Asset identifier (value 1-50)
    int asset_id filters=min:1|max:50
  
    // Rarity tier: bronze, silver, gold, legendary
    text tier_id filters=trim|lower
  
    // Optional slot index for multiple equip slots (e.g. medal slot 1, 2, 3)
    int? slot_index? filters=min:1|max:3
  }

  stack {
    // Verify ownership in user_cosmetics table
    db.query user_cosmetics {
      where = $db.user_cosmetics.user_id == $auth.id && $db.user_cosmetics.cosmetic_type == $input.cosmetic_type && $db.user_cosmetics.asset_id == $input.asset_id && $db.user_cosmetics.tier == $input.tier_id
      return = {type: "single"}
    } as $owned_cosmetic
  
    // Enforce 403 UNOWNED_COSMETIC_LOCKED if caller does not own the requested cosmetic
    precondition ($owned_cosmetic != null) {
      error_type = "accessdenied"
      error = "UNOWNED_COSMETIC_LOCKED"
    }
  
    // Construct authoritative asset image URL
    var $cosmetic_url {
      value = "https://topgamer.gg" ~ $input.cosmetic_type ~ "s/" ~ $input.tier_id ~ "/" ~ ($input.asset_id|to_text) ~ ".png"
    }
  
    // Determine target slot field on user_equipped
    var $equipped_data {
      value = {}
    }
  
    conditional {
      if ($input.cosmetic_type == "emblem") {
        var.update $equipped_data {
          value = {
            equipped_emblem_url: $cosmetic_url
            emblem_id          : $input.asset_id
          }
        }
      }
    
      elseif ($input.cosmetic_type == "medal") {
        conditional {
          if ($input.slot_index == 2) {
            var.update $equipped_data {
              value = {equipped_medal_2: $cosmetic_url}
            }
          }
        
          elseif ($input.slot_index == 3) {
            var.update $equipped_data {
              value = {equipped_medal_3: $cosmetic_url}
            }
          }
        
          else {
            var.update $equipped_data {
              value = {
                equipped_medal_1: $cosmetic_url
                medal_id        : $input.asset_id
              }
            }
          }
        }
      }
    
      else {
        var.update $equipped_data {
          value = {
            equipped_card_url: $cosmetic_url
            calling_card_id  : $input.asset_id
          }
        }
      }
    }
  
    // Check existing equipped record for user
    db.query user_equipped {
      where = $db.user_equipped.user_id == $auth.id
      return = {type: "single"}
    } as $equipped_row
  
    // Upsert user_equipped row
    conditional {
      if ($equipped_row == null) {
        db.add user_equipped {
          data = {
            user_id            : $auth.id
            equipped_emblem_url: ($input.cosmetic_type == "emblem" ? $cosmetic_url : "")
            equipped_medal_1   : ($input.cosmetic_type == "medal" && ($input.slot_index == null || $input.slot_index == 1) ? $cosmetic_url : "")
            equipped_medal_2   : ($input.cosmetic_type == "medal" && $input.slot_index == 2 ? $cosmetic_url : "")
            equipped_medal_3   : ($input.cosmetic_type == "medal" && $input.slot_index == 3 ? $cosmetic_url : "")
            equipped_card_url  : ($input.cosmetic_type == "card" ? $cosmetic_url : "")
            calling_card_id    : ($input.cosmetic_type == "card" ? $input.asset_id : null)
            emblem_id          : ($input.cosmetic_type == "emblem" ? $input.asset_id : null)
            medal_id           : ($input.cosmetic_type == "medal" && ($input.slot_index == null || $input.slot_index == 1) ? $input.asset_id : null)
          }
        } as $equipped_row
      }
    
      else {
        db.patch user_equipped {
          field_name = "id"
          field_value = $equipped_row.id
          data = $equipped_data
        } as $equipped_row
      }
    }
  
    // Sync card tier to profile when a card is equipped
    conditional {
      if ($input.cosmetic_type == "card") {
        db.query profile {
          where = $db.profile.user_id == $auth.id
          return = {type: "single"}
        } as $caller_profile
      
        conditional {
          if ($caller_profile != null) {
            db.edit profile {
              field_name = "id"
              field_value = $caller_profile.id
              data = {calling_card_tier: $input.tier_id}
            } as $updated_profile
          }
        }
      }
    }
  }

  response = {
    success      : true
    url          : $cosmetic_url
    equipped_url : $cosmetic_url
    user_equipped: $equipped_row
  }
}