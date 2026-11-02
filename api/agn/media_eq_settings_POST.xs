// Save user interactive equalizer sliders, presets, and spectrum visualizer preferences
query media_eq_settings verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Preset: electronic_cyber, bass_boost, vocal_clarity, esports_focus, flat, custom
    text active_preset?=custom
  
    // 10-band slider gain values in dB (32Hz to 16kHz)
    json? eq_bands
  
    // Spectrum visualizer animation style: bars, wave, circular, neon_glow
    text spectrum_visualizer_mode?=bars
  
    // Bass boost multiplier
    decimal bass_boost_level?
  
    // 3D spatial surround toggle
    bool is_surround_enabled?
  }

  stack {
    // Check if user already has an EQ configuration record
    db.query user_audio_eq {
      where = $db.user_audio_eq.user_id == $auth.id
      return = {type: "single"}
    } as $existing_eq
  
    conditional {
      if ($existing_eq != null) {
        db.edit user_audio_eq {
          field_name = "id"
          field_value = $existing_eq.id
          data = {
            active_preset           : $input.active_preset
            eq_bands                : $input.eq_bands
            spectrum_visualizer_mode: $input.spectrum_visualizer_mode
            bass_boost_level        : $input.bass_boost_level
            is_surround_enabled     : $input.is_surround_enabled
          }
        } as $saved_eq
      }
    
      else {
        db.add user_audio_eq {
          data = {
            user_id                 : $auth.id
            active_preset           : $input.active_preset
            eq_bands                : $input.eq_bands
            spectrum_visualizer_mode: $input.spectrum_visualizer_mode
            bass_boost_level        : $input.bass_boost_level
            is_surround_enabled     : $input.is_surround_enabled
          }
        } as $saved_eq
      }
    }
  }

  response = {
    success  : true
    message  : "Equalizer and spectrum visualizer settings saved."
    equalizer: $saved_eq
  }
}