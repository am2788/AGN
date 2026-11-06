// Update user profile whitelisting only display_name, theme_id, and social URLs
query "profile/me" verb=PATCH {
  api_group = "AGN"
  auth = "user"

  input {
    // Whitelisted: display name
    text? display_name? filters=trim
  
    // Whitelisted: active theme ID
    text? theme_id? filters=trim
  
    // Whitelisted: YouTube social URL
    text? youtube_url? filters=trim
  
    // Whitelisted: Spotify social URL
    text? spotify_url? filters=trim
  
    // Whitelisted: Twitch social URL
    text? twitch_url? filters=trim
  
    // Whitelisted: SoundCloud social URL
    text? soundcloud_url? filters=trim
  }

  stack {
    // If theme_id is updated, validate theme exists and is enabled
    conditional {
      if ($input.theme_id != null && $input.theme_id != "") {
        db.query app_themes {
          where = $db.app_themes.theme_id == $input.theme_id && $db.app_themes.enabled == true
          return = {type: "single"}
        } as $valid_theme
      
        precondition ($valid_theme != null) {
          error_type = "inputerror"
          error = "Requested theme is invalid or disabled."
        }
      }
    }
  
    // Fetch existing profile
    db.query profile {
      where = $db.profile.user_id == $auth.id
      return = {type: "single"}
    } as $user_profile
  
    // Build whitelisted update payload
    var $updates {
      value = {}
    }
  
    conditional {
      if ($input.display_name != null) {
        var.update $updates.display_name {
          value = $input.display_name
        }
      }
    }
  
    conditional {
      if ($input.theme_id != null) {
        var.update $updates.theme_id {
          value = $input.theme_id
        }
      }
    }
  
    conditional {
      if ($input.youtube_url != null) {
        var.update $updates.youtube_url {
          value = $input.youtube_url
        }
      }
    }
  
    conditional {
      if ($input.spotify_url != null) {
        var.update $updates.spotify_url {
          value = $input.spotify_url
        }
      }
    }
  
    conditional {
      if ($input.twitch_url != null) {
        var.update $updates.twitch_url {
          value = $input.twitch_url
        }
      }
    }
  
    conditional {
      if ($input.soundcloud_url != null) {
        var.update $updates.soundcloud_url {
          value = $input.soundcloud_url
        }
      }
    }
  
    conditional {
      if ($user_profile == null) {
        db.add profile {
          data = {
            user_id       : $auth.id
            handle        : ("player_" ~ $auth.id)
            display_name  : ($input.display_name ?? ($auth.name ?? "Player"))
            pathway       : "spectator"
            age_band      : "unknown"
            theme_id      : ($input.theme_id ?? "simple-gold")
            youtube_url   : $input.youtube_url
            spotify_url   : $input.spotify_url
            twitch_url    : $input.twitch_url
            soundcloud_url: $input.soundcloud_url
          }
        } as $saved_profile
      }
    
      else {
        db.patch profile {
          field_name = "id"
          field_value = $user_profile.id
          data = $updates
        } as $saved_profile
      }
    }
  }

  response = {success: true, profile: $saved_profile}
}