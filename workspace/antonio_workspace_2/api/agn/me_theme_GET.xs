// Get current authenticated user's active theme with graceful fallback to simple-gold
query "me/theme" verb=GET {
  api_group = "AGN"
  auth = "user"

  input {
  }

  stack {
    // Retrieve caller profile
    db.query profile {
      where = $db.profile.user_id == $auth.id
      return = {type: "single"}
    } as $user_profile
  
    var $saved_theme {
      value = ($user_profile.theme_id ?? "simple-gold")
    }
  
    // Verify saved theme is currently enabled in catalog
    db.query app_themes {
      where = $db.app_themes.theme_id == $saved_theme && $db.app_themes.enabled == true
      return = {type: "single"}
    } as $theme_record
  
    // Fall back to simple-gold without overwriting DB profile if saved theme is disabled
    var $active_theme {
      value = "simple-gold"
    }
  
    conditional {
      if ($theme_record != null) {
        var.update $active_theme {
          value = $saved_theme
        }
      }
    
      else {
        // Fetch default simple-gold theme record
        db.query app_themes {
          where = $db.app_themes.theme_id == "simple-gold"
          return = {type: "single"}
        } as $theme_record
      }
    }
  }

  response = {
    theme_id      : $active_theme
    saved_theme_id: $saved_theme
    is_fallback   : ($active_theme != $saved_theme)
    theme         : $theme_record
  }
}