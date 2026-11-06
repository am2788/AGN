// User 10-band equalizer presets for the Media Deck
table eq_presets {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Preset owner user account
    int user_id {
      table = "user"
    }
  
    // Preset display name
    text name filters=trim
  
    // 10-band array with freq, gain, q, type, on, solo, mute
    json bands
  
    // Low cut filter frequency in Hz
    decimal? low_cut
  
    // High cut filter frequency in Hz
    decimal? high_cut
  
    // Overall master output gain percentage (0 to 200)
    decimal output_gain_pct?=100
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "user_id"}]}
  ]
}