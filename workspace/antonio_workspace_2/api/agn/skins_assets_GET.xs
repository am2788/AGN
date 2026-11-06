// Retrieve screen layer assets for a theme (public returns shell only, admin returns full and shell)
query "skins/assets" verb=GET {
  api_group = "AGN"

  input {
    // Theme identifier (e.g. skin-gold, skin-redneon)
    text theme filters=trim
  
    // Optional device filter: desk or mob
    text? device? filters=trim
  
    // Optional screen filter
    text? screen? filters=trim
  }

  stack {
    // Determine admin status from incoming authorization token if provided
    var $is_admin {
      value = false
    }
  
    conditional {
      if ($env.$request_auth_token != null && $env.$request_auth_token != "") {
        // Decode token to check admin role
        try_catch {
          try {
            // Verify if caller corresponds to an admin
            db.query user {
              where = $db.user.role == "admin"
              return = {type: "single"}
            } as $admin_user
          
            conditional {
              if ($admin_user != null) {
                var.update $is_admin {
                  value = true
                }
              }
            }
          }
        
          catch {
            var.update $is_admin {
              value = false
            }
          }
        }
      }
    }
  
    // Query skin assets based on role permissions
    conditional {
      if ($is_admin) {
        db.query skin_assets {
          where = $db.skin_assets.theme_id == $input.theme && $db.skin_assets.device ==? $input.device && $db.skin_assets.screen ==? $input.screen
          return = {type: "list"}
        } as $assets
      }
    
      else {
        db.query skin_assets {
          where = $db.skin_assets.theme_id == $input.theme && $db.skin_assets.layer == "shell" && $db.skin_assets.device ==? $input.device && $db.skin_assets.screen ==? $input.screen
          return = {type: "list"}
        } as $assets
      }
    }
  }

  response = {
    theme : $input.theme
    layer : ($is_admin ? "all" : "shell")
    assets: $assets
  }
}