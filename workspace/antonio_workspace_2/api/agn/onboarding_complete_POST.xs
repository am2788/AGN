// Complete onboarding with official AGN welcome quote, friendship, and default simple-gold theme
query "onboarding/complete" verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Optional desired user handle/slug
    text? handle? filters=trim|lower
  
    // Optional display name
    text? display_name? filters=trim
  }

  stack {
    // Automatically seed AGN official account as first accepted friend and inject Aether welcome message
    function.run ensure_agn_onboarding {
      input = {user_id: $auth.id}
    } as $agn_onboard
  
    // Look up caller profile
    db.query profile {
      where = $db.profile.user_id == $auth.id
      return = {type: "single"}
    } as $user_profile
  
    var $theme_id {
      value = "simple-gold"
    }
  
    conditional {
      if ($user_profile == null) {
        // Generate default handle if not provided
        var $default_handle {
          value = ($input.handle ?? ("user_" ~ ($auth.id|to_text)))
        }
      
        var $default_display {
          value = ($input.display_name ?? ($auth.name ?? "Competitor"))
        }
      
        db.add profile {
          data = {
            user_id     : $auth.id
            handle      : $default_handle
            display_name: $default_display
            pathway     : "spectator"
            age_band    : "unknown"
            theme_id    : "simple-gold"
          }
        } as $new_profile
      
        var.update $theme_id {
          value = "simple-gold"
        }
      }
    
      else {
        conditional {
          if ($user_profile.theme_id == null || $user_profile.theme_id == "") {
            db.edit profile {
              field_name = "id"
              field_value = $user_profile.id
              data = {theme_id: "simple-gold"}
            } as $updated_profile
          
            var.update $theme_id {
              value = "simple-gold"
            }
          }
        
          else {
            var.update $theme_id {
              value = $user_profile.theme_id
            }
          }
        }
      }
    }
  }

  response = {thread_id: $agn_onboard.thread_id, theme_id: $theme_id}
}