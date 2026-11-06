// Get current user session, profile, and authoritative theme preferences server-side
query me verb=GET {
  api_group = "AGN"
  auth = "user"

  input {
  }

  stack {
    // Fetch authenticated user account
    db.get user {
      field_name = "id"
      field_value = $auth.id
      output = ["id", "created_at", "name", "email", "role", "is_wired_verified"]
    } as $user_record
  
    // Fetch authoritative profile
    db.query profile {
      where = $db.profile.user_id == $auth.id
      return = {type: "single"}
    } as $user_profile
  
    var $saved_theme {
      value = ($user_profile.theme_id ?? "simple-gold")
    }
  
    // Check if saved theme is currently enabled in catalog
    db.query app_themes {
      where = $db.app_themes.theme_id == $saved_theme && $db.app_themes.enabled == true
      return = {type: "single"}
    } as $theme_record
  
    var $active_theme {
      value = "simple-gold"
    }
  
    conditional {
      if ($theme_record != null) {
        var.update $active_theme {
          value = $saved_theme
        }
      }
    }
  }

  response = {
    user    : $user_record
    profile : $user_profile
    theme_id: $active_theme
  }
}