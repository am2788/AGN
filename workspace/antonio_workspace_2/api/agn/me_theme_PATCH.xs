// Update authenticated user's active theme after verifying theme is enabled
query "me/theme" verb=PATCH {
  api_group = "AGN"
  auth = "user"

  input {
    // Theme identifier to equip
    text theme_id filters=trim
  }

  stack {
    // Verify theme exists and is currently enabled
    db.query app_themes {
      where = $db.app_themes.theme_id == $input.theme_id && $db.app_themes.enabled == true
      return = {type: "single"}
    } as $valid_theme
  
    precondition ($valid_theme != null) {
      error_type = "inputerror"
      error = "Selected theme does not exist or is currently disabled."
    }
  
    // Fetch caller profile
    db.query profile {
      where = $db.profile.user_id == $auth.id
      return = {type: "single"}
    } as $user_profile
  
    conditional {
      if ($user_profile == null) {
        db.add profile {
          data = {
            user_id     : $auth.id
            handle      : ("user_" ~ $auth.id)
            display_name: ($auth.name ?? "Competitor")
            pathway     : "spectator"
            age_band    : "unknown"
            theme_id    : $input.theme_id
          }
        } as $created_profile
      }
    
      else {
        db.edit profile {
          field_name = "id"
          field_value = $user_profile.id
          data = {theme_id: $input.theme_id}
        } as $updated_profile
      }
    }
  }

  response = {
    success : true
    theme_id: $input.theme_id
    theme   : $valid_theme
  }
}