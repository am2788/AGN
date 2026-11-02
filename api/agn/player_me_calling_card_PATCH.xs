// Equip active calling card tier (standard or premium) ensuring slot is unlocked
query "player/me/calling_card" verb=PATCH {
  api_group = "AGN"
  auth = "user"

  input {
    // Calling card tier to equip: standard or premium
    text equipped_tier
  }

  stack {
    // Validate input value
    precondition ($input.equipped_tier == "standard" || $input.equipped_tier == "premium") {
      error_type = "inputerror"
      error = "equipped_tier must be either 'standard' or 'premium'."
    }
  
    // Get the player where user_id equals the auth user
    db.query player {
      where = $db.player.user_id == $auth.id
      return = {type: "single"}
    } as $player
  
    precondition ($player != null) {
      error_type = "notfound"
      error = "Player profile not found for this user."
    }
  
    // Precondition: the slot for that tier must be filled, otherwise return an error
    conditional {
      if ($input.equipped_tier == "standard") {
        precondition ($player.standard_card_id != null) {
          error_type = "inputerror"
          error = "Standard calling card slot is not unlocked or equipped."
        }
      }
    
      elseif ($input.equipped_tier == "premium") {
        precondition ($player.premium_card_id != null) {
          error_type = "inputerror"
          error = "Premium calling card slot is not unlocked or equipped."
        }
      }
    }
  
    // Update equipped_tier
    db.edit player {
      field_name = "id"
      field_value = $player.id
      data = {equipped_tier: $input.equipped_tier}
    } as $updated_player
  }

  response = {
    success      : true
    equipped_tier: $updated_player.equipped_tier
    player_id    : $updated_player.id
  }
}