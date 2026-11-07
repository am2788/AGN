// Update participant profile: multi-theme persistence, display name, and social URLs
query participant_profile verb=PATCH {
  api_group = "AGN"
  auth = "user"

  input {
    // Whitelisted: active theme ID from app_themes catalog
    text? theme_id? filters=trim
  
    // Whitelisted: display name
    text? display_name? filters=trim
  
    // Whitelisted: YouTube social URL
    text? youtube_url? filters=trim
  
    // Whitelisted: Spotify social URL
    text? spotify_url? filters=trim
  
    // Whitelisted: Twitch social URL
    text? twitch_url? filters=trim
  
    // Whitelisted: SoundCloud social URL
    text? soundcloud_url? filters=trim
  
    // Whitelisted: Primary direct match stream URL
    text? primary_stream_url? filters=trim
  }

  stack {
    // Multi-theme validation: verify requested theme exists and is enabled
    conditional {
      if ($input.theme_id != null && $input.theme_id != "") {
        db.query app_themes {
          where = $db.app_themes.theme_id == $input.theme_id && $db.app_themes.enabled == true
          return = {type: "single"}
        } as $valid_theme
      
        precondition ($valid_theme != null) {
          error_type = "inputerror"
          error = "Requested theme is invalid or currently disabled."
        }
      }
    }
  
    // Fetch caller user record
    db.get user {
      field_name = "id"
      field_value = $auth.id
    } as $user_record
  
    // Fetch existing participant profile record
    db.query profile {
      where = $db.profile.user_id == $auth.id
      return = {type: "single"}
    } as $user_profile
  
    // Build profile updates payload
    var $profile_updates {
      value = {}
    }
  
    conditional {
      if ($input.display_name != null) {
        var.update $profile_updates.display_name {
          value = $input.display_name
        }
      }
    }
  
    conditional {
      if ($input.theme_id != null) {
        var.update $profile_updates.theme_id {
          value = $input.theme_id
        }
      }
    }
  
    conditional {
      if ($input.youtube_url != null) {
        var.update $profile_updates.youtube_url {
          value = $input.youtube_url
        }
      }
    }
  
    conditional {
      if ($input.spotify_url != null) {
        var.update $profile_updates.spotify_url {
          value = $input.spotify_url
        }
      }
    }
  
    conditional {
      if ($input.twitch_url != null) {
        var.update $profile_updates.twitch_url {
          value = $input.twitch_url
        }
      }
    }
  
    conditional {
      if ($input.soundcloud_url != null) {
        var.update $profile_updates.soundcloud_url {
          value = $input.soundcloud_url
        }
      }
    }
  
    // Upsert participant profile
    conditional {
      if ($user_profile == null) {
        db.add profile {
          data = {
            user_id       : $auth.id
            handle        : ("player_" ~ ($auth.id|to_text))
            display_name  : ($input.display_name ?? ($user_record.name ?? "Player"))
            pathway       : ($user_record.pathway ?? "spectator")
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
          data = $profile_updates
        } as $saved_profile
      }
    }
  
    // Mirror social URLs and stream URL to user record for unified spectator discovery
    var $user_updates {
      value = {}
    }
  
    conditional {
      if ($input.youtube_url != null) {
        var.update $user_updates.social_youtube {
          value = $input.youtube_url
        }
      }
    }
  
    conditional {
      if ($input.twitch_url != null) {
        var.update $user_updates.social_twitch {
          value = $input.twitch_url
        }
      }
    }
  
    conditional {
      if ($input.spotify_url != null) {
        var.update $user_updates.social_spotify {
          value = $input.spotify_url
        }
      }
    }
  
    conditional {
      if ($input.primary_stream_url != null) {
        var.update $user_updates.primary_stream_url {
          value = $input.primary_stream_url
        }
      }
    }
  
    conditional {
      if ($input.display_name != null) {
        var.update $user_updates.name {
          value = $input.display_name
        }
      }
    }
  
    conditional {
      if ($user_updates != {}) {
        db.patch user {
          field_name = "id"
          field_value = $auth.id
          data = $user_updates
        } as $updated_user
      }
    }
  }

  response = {
    success : true
    theme_id: ($input.theme_id ?? ($saved_profile.theme_id ?? "simple-gold"))
    profile : $saved_profile
    message : "Participant profile, theme, and social URLs updated successfully."
  }
}