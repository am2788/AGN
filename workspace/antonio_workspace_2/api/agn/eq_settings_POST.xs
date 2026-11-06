// Save 10-band Media Deck equalizer settings validating 10 bands and output gain range
query eq_settings verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Preset name
    text name?=Custom filters=trim
  
    // 10-band array with freq, gain, q, type, on, solo, mute
    json bands
  
    // Low cut filter in Hz
    decimal? low_cut?
  
    // High cut filter in Hz
    decimal? high_cut?
  
    // Master output gain percentage (0 to 200)
    decimal output_gain_pct?=100
  }

  stack {
    // Validate bands array contains exactly 10 bands
    var $band_count {
      value = $input.bands|count
    }
  
    precondition ($band_count == 10) {
      error_type = "inputerror"
      error = "Equalizer configuration requires exactly 10 frequency bands."
    }
  
    // Validate output_gain_pct is between 0 and 200
    precondition ($input.output_gain_pct >= 0 && $input.output_gain_pct <= 200) {
      error_type = "inputerror"
      error = "Master output gain percentage must be between 0 and 200."
    }
  
    // Check if preset already exists for user
    db.query eq_presets {
      where = $db.eq_presets.user_id == $auth.id
      return = {type: "single"}
    } as $existing_preset
  
    conditional {
      if ($existing_preset == null) {
        db.add eq_presets {
          data = {
            user_id        : $auth.id
            name           : $input.name
            bands          : $input.bands
            low_cut        : $input.low_cut
            high_cut       : $input.high_cut
            output_gain_pct: $input.output_gain_pct
          }
        } as $saved_preset
      }
    
      else {
        db.edit eq_presets {
          field_name = "id"
          field_value = $existing_preset.id
          data = {
            name           : $input.name
            bands          : $input.bands
            low_cut        : $input.low_cut
            high_cut       : $input.high_cut
            output_gain_pct: $input.output_gain_pct
          }
        } as $saved_preset
      }
    }
  }

  response = {success: true, preset: $saved_preset}
}