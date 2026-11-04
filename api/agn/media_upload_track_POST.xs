// Upload MP3 or link YouTube/Spotify track with artwork and color-matched theme palette
query media_upload_track verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Song title
    text title filters=trim
  
    // Performing artist
    text? artist filters=trim
  
    // Album name
    text? album filters=trim
  
    // Audio file URL or streaming provider URI
    text source_url filters=trim
  
    // Artwork cover URL
    text? artwork_url filters=trim
  
    // Color-matched theme palette JSON (primary, secondary, background)
    json? color_palette
  
    // Provider platform: upload, youtube_music, spotify_premium, soundcloud
    text source_platform?=upload
  
    // Track duration in seconds
    int? duration_seconds?=0
  }

  stack {
    precondition (($input.title|strlen) > 0 && ($input.source_url|strlen) > 0) {
      error_type = "inputerror"
      error = "Track title and source URL are required."
    }
  
    // Default color palette if none extracted from artwork
    var $theme_palette {
      value = {
        primary    : "#E60026"
        secondary  : "#FFB800"
        background : "#0D0D11"
        accent_glow: "#FF003C"
      }
    }
  
    conditional {
      if ($input.color_palette != null) {
        var.update $theme_palette {
          value = $input.color_palette
        }
      }
    }
  
    // Insert track into spectator audio collection
    db.add spectator_audio {
      data = {
        user_id         : $auth.id
        title           : $input.title
        artist          : $input.artist
        album           : $input.album
        source_url      : $input.source_url
        artwork_url     : $input.artwork_url
        color_palette   : $theme_palette
        source_platform : $input.source_platform
        duration_seconds: $input.duration_seconds
      }
    } as $track
  }

  response = {
    success            : true
    track              : $track
    color_matched_theme: $theme_palette
  }
}