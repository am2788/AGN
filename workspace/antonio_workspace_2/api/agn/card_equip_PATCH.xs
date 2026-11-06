// Equip active calling card after verifying user ownership and eligibility
query "card/equip" verb=PATCH {
  api_group = "AGN"
  auth = "user"

  input {
    // Calling card ID to equip
    int card_id {
      table = "calling_card"
    }
  }

  stack {
    // Look up card in catalog
    db.get calling_card {
      field_name = "id"
      field_value = $input.card_id
    } as $card
  
    precondition ($card != null) {
      error_type = "notfound"
      error = "Calling card not found."
    }
  
    // Verify ownership in user_cosmetic or player_calling_card
    db.query user_cosmetic {
      where = $db.user_cosmetic.user_id == $auth.id && $db.user_cosmetic.cosmetic_type == "calling_card" && $db.user_cosmetic.cosmetic_id == $input.card_id
      return = {type: "exists"}
    } as $owns_cosmetic
  
    db.query player_calling_card {
      where = $db.player_calling_card.player_id == $auth.id && $db.player_calling_card.calling_card_id == $input.card_id
      return = {type: "exists"}
    } as $owns_legacy
  
    // Default standard card is always unlocked
    var $is_owned {
      value = ($owns_cosmetic || $owns_legacy || $card.key == "standard")
    }
  
    precondition ($is_owned) {
      error_type = "accessdenied"
      error = "You do not own or have not unlocked this calling card."
    }
  
    // Verify non-locked eligibility for premium motion cards
    conditional {
      if ($card.is_premium) {
        db.get user {
          field_name = "id"
          field_value = $auth.id
        } as $user_record
      
        var $eligible {
          value = ($user_record.is_wired_verified || $user_record.has_first_strike || $user_record.role == "admin" || $user_record.kyc_status == "approved")
        }
      
        precondition ($eligible) {
          error_type = "accessdenied"
          error = "Premium calling card slot is locked. Verified integrity or KYC status required."
        }
      }
    }
  
    // Upsert into user_equipped
    db.query user_equipped {
      where = $db.user_equipped.user_id == $auth.id
      return = {type: "single"}
    } as $equipped_row
  
    conditional {
      if ($equipped_row == null) {
        db.add user_equipped {
          data = {user_id: $auth.id, calling_card_id: $input.card_id}
        } as $equipped_row
      }
    
      else {
        db.edit user_equipped {
          field_name = "id"
          field_value = $equipped_row.id
          data = {calling_card_id: $input.card_id}
        } as $equipped_row
      }
    }
  
    // Sync calling card tier to profile
    db.query profile {
      where = $db.profile.user_id == $auth.id
      return = {type: "single"}
    } as $caller_profile
  
    conditional {
      if ($caller_profile != null) {
        db.edit profile {
          field_name = "id"
          field_value = $caller_profile.id
          data = {calling_card_tier: $card.tier}
        } as $updated_profile
      }
    }
  }

  response = {success: true, equipped_card: $card}
}