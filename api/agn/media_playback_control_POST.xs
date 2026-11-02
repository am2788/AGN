// Live media player controls: volume, pause/play, volume boost (up to 200%), and fullscreen mode
query media_playback_control verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Playback transport action: play, pause, stop, toggle_play, next, previous
    text action?=play
  
    // Current track being played
    int? track_id {
      table = "spectator_audio"
    }
  
    // Volume level (0 to 100)
    int? volume filters=min:0|max:100
  
    // High-gain volume amplifier boost (1.0 = 100% normal, up to 2.0 = 200% super-boost)
    decimal? volume_boost_level filters=min:1.0|max:2.0
  
    // Mute state
    bool? is_muted
  
    // Shuffle toggle
    bool? is_shuffle
  
    // Repeat toggle
    bool? is_repeat
  
    // Fullscreen theater mode toggle
    bool? is_fullscreen
  
    // Client device profile: desktop, mobile, console
    text? device_profile?=desktop
  }

  stack {
    // Retrieve existing user audio EQ and playback record
    db.query user_audio_eq {
      where = $db.user_audio_eq.user_id == $auth.id
      return = {type: "single"}
    } as $existing_eq
  
    // Determine target playback state
    var $new_state {
      value = "playing"
    }
  
    conditional {
      if ($input.action == "pause") {
        var.update $new_state {
          value = "paused"
        }
      }
    
      elseif ($input.action == "stop") {
        var.update $new_state {
          value = "stopped"
        }
      }
    
      elseif ($input.action == "toggle_play") {
        conditional {
          if ($existing_eq != null && $existing_eq.playback_state == "playing") {
            var.update $new_state {
              value = "paused"
            }
          }
        
          else {
            var.update $new_state {
              value = "playing"
            }
          }
        }
      }
    }
  
    // Prepare update parameters
    var $vol {
      value = 80
    }
  
    var $boost {
      value = 1
    }
  
    var $muted {
      value = false
    }
  
    var $shuff {
      value = false
    }
  
    var $rep {
      value = false
    }
  
    var $fscreen {
      value = false
    }
  
    var $tid {
      value = $input.track_id
    }
  
    conditional {
      if ($existing_eq != null) {
        var.update $vol {
          value = $existing_eq.volume
        }
      
        var.update $boost {
          value = $existing_eq.volume_boost_level
        }
      
        var.update $muted {
          value = $existing_eq.is_muted
        }
      
        var.update $shuff {
          value = $existing_eq.is_shuffle
        }
      
        var.update $rep {
          value = $existing_eq.is_repeat
        }
      
        var.update $fscreen {
          value = $existing_eq.is_fullscreen
        }
      
        conditional {
          if ($input.track_id == null) {
            var.update $tid {
              value = $existing_eq.current_track_id
            }
          }
        }
      }
    }
  
    // Apply input overrides
    conditional {
      if ($input.volume != null) {
        var.update $vol {
          value = $input.volume
        }
      }
    }
  
    conditional {
      if ($input.volume_boost_level != null) {
        var.update $boost {
          value = $input.volume_boost_level
        }
      }
    }
  
    conditional {
      if ($input.is_muted != null) {
        var.update $muted {
          value = $input.is_muted
        }
      }
    }
  
    conditional {
      if ($input.is_shuffle != null) {
        var.update $shuff {
          value = $input.is_shuffle
        }
      }
    }
  
    conditional {
      if ($input.is_repeat != null) {
        var.update $rep {
          value = $input.is_repeat
        }
      }
    }
  
    conditional {
      if ($input.is_fullscreen != null) {
        var.update $fscreen {
          value = $input.is_fullscreen
        }
      }
    }
  
    // Upsert audio EQ & playback state
    conditional {
      if ($existing_eq != null) {
        db.edit user_audio_eq {
          field_name = "id"
          field_value = $existing_eq.id
          data = {
            playback_state    : $new_state
            current_track_id  : $tid
            volume            : $vol
            volume_boost_level: $boost
            is_muted          : $muted
            is_shuffle        : $shuff
            is_repeat         : $rep
            is_fullscreen     : $fscreen
            device_profile    : $input.device_profile
          }
        } as $updated_state
      }
    
      else {
        db.add user_audio_eq {
          data = {
            user_id           : $auth.id
            playback_state    : $new_state
            current_track_id  : $tid
            volume            : $vol
            volume_boost_level: $boost
            is_muted          : $muted
            is_shuffle        : $shuff
            is_repeat         : $rep
            is_fullscreen     : $fscreen
            device_profile    : $input.device_profile
          }
        } as $updated_state
      }
    }
  }

  response = {
    playback_state: $updated_state.playback_state
    track_id      : $updated_state.current_track_id
    controls      : ```
      {
        volume: $updated_state.volume,
        volume_boost_multiplier: $updated_state.volume_boost_level,
        effective_gain_percent: $updated_state.volume * $updated_state.volume_boost_level,
        is_muted: $updated_state.is_muted,
        is_shuffle: $updated_state.is_shuffle,
        is_repeat: $updated_state.is_repeat,
        is_fullscreen: $updated_state.is_fullscreen
      }
      ```
    device_profile: $updated_state.device_profile
  }
}