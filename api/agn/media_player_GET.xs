// Retrieve music player dashboard tracks, interactive EQ settings, and color-matched themes
query media_player verb=GET {
  api_group = "AGN"
  auth = "user"

  input {
  }

  stack {
    // Retrieve user's personal audio tracks and connected streams
    db.query spectator_audio {
      where = $db.spectator_audio.user_id == $auth.id
      sort = {sort_order: "asc", created_at: "desc"}
      return = {type: "list"}
    } as $tracks
  
    // Retrieve user's equalizer preferences
    db.query user_audio_eq {
      where = $db.user_audio_eq.user_id == $auth.id
      return = {type: "single"}
    } as $user_eq
  
    // Fallback default EQ bands and presets
    var $active_eq {
      value = {
        active_preset           : "electronic_cyber"
        eq_bands                : {
          "32Hz": 4.5,
          "64Hz": 6.0,
          "125Hz": 3.0,
          "250Hz": 0.0,
          "500Hz": -1.5,
          "1kHz": 1.0,
          "2kHz": 3.5,
          "4kHz": 5.0,
          "8kHz": 6.5,
          "16kHz": 7.0
        }
        spectrum_visualizer_mode: "bars"
        bass_boost_level        : 3.5
        is_surround_enabled     : true
      }
    }
  
    conditional {
      if ($user_eq != null) {
        var.update $active_eq {
          value = $user_eq
        }
      }
    }
  
    // Built-in studio presets
    var $presets {
      value = {
        electronic_cyber: {
          name: "Electronic Cyber",
          description: "Pulsing sub-bass and crisp high-frequency treble for retro-futuristic synth",
          bands: {"32Hz": 4.5, "64Hz": 6.0, "125Hz": 3.0, "250Hz": 0.0, "500Hz": -1.5, "1kHz": 1.0, "2kHz": 3.5, "4kHz": 5.0, "8kHz": 6.5, "16kHz": 7.0}
        }
        bass_boost      : {
          name: "Colosseum Bass Boost",
          description: "Heavy low-end impact designed for high-energy match hype",
          bands: {"32Hz": 8.0, "64Hz": 7.5, "125Hz": 5.0, "250Hz": 2.0, "500Hz": 0.0, "1kHz": 0.0, "2kHz": 1.0, "4kHz": 2.0, "8kHz": 3.0, "16kHz": 4.0}
        }
        vocal_clarity   : {
          name: "Vocal Clarity",
          description: "Midrange enhancement to keep vocals and commentary crystal clear",
          bands: {"32Hz": -2.0, "64Hz": -1.0, "125Hz": 1.0, "250Hz": 3.0, "500Hz": 5.0, "1kHz": 6.0, "2kHz": 5.0, "4kHz": 3.5, "8kHz": 2.0, "16kHz": 1.0}
        }
        esports_focus   : {
          name: "Esports Focus",
          description: "Boosted upper-mid and high frequencies for tactical game cues and crisp rhythm",
          bands: {"32Hz": -3.0, "64Hz": -2.0, "125Hz": 0.0, "250Hz": 1.5, "500Hz": 2.0, "1kHz": 4.0, "2kHz": 6.5, "4kHz": 7.0, "8kHz": 8.0, "16kHz": 6.0}
        }
        flat            : {
          name: "Flat Studio",
          description: "Neutral reference curve with zero coloring",
          bands: {"32Hz": 0.0, "64Hz": 0.0, "125Hz": 0.0, "250Hz": 0.0, "500Hz": 0.0, "1kHz": 0.0, "2kHz": 0.0, "4kHz": 0.0, "8kHz": 0.0, "16kHz": 0.0}
        }
      }
    }
  }

  response = {
    tracks             : $tracks
    interactive_eq     : $active_eq
    available_presets  : $presets
    spectrum_visualizer: ```
      {
        is_synced: true,
        default_mode: $active_eq.spectrum_visualizer_mode,
        bands_count: 10
      }
      ```
  }
}