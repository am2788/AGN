// Retrieve user's Media Deck 10-band equalizer settings
query eq_settings verb=GET {
  api_group = "AGN"
  auth = "user"

  input {
  }

  stack {
    // Look up saved equalizer preset for user
    db.query eq_presets {
      where = $db.eq_presets.user_id == $auth.id
      sort = {id: "desc"}
      return = {type: "single"}
    } as $preset
  
    // Default 10-band studio EQ if user has not yet customized
    var $default_bands {
      value = [
        {freq: 32, gain: 0, mute: false, on: true, q: 1.4, solo: false, type: "bell"}
        {freq: 64, gain: 0, mute: false, on: true, q: 1.4, solo: false, type: "bell"}
        {freq: 125, gain: 0, mute: false, on: true, q: 1.4, solo: false, type: "bell"}
        {freq: 250, gain: 0, mute: false, on: true, q: 1.4, solo: false, type: "bell"}
        {freq: 500, gain: 0, mute: false, on: true, q: 1.4, solo: false, type: "bell"}
        {freq: 1000, gain: 0, mute: false, on: true, q: 1.4, solo: false, type: "bell"}
        {freq: 2000, gain: 0, mute: false, on: true, q: 1.4, solo: false, type: "bell"}
        {freq: 4000, gain: 0, mute: false, on: true, q: 1.4, solo: false, type: "bell"}
        {freq: 8000, gain: 0, mute: false, on: true, q: 1.4, solo: false, type: "bell"}
        {freq: 16000, gain: 0, mute: false, on: true, q: 1.4, solo: false, type: "bell"}
      ]
    }
  
    var $settings {
      value = ```
        ($preset ?? {
                user_id        : $auth.id
                name           : "Default Flat"
                bands          : $default_bands
                low_cut        : 20
                high_cut       : 20000
                output_gain_pct: 100
              })
        ```
    }
  }

  response = {settings: $settings}
}