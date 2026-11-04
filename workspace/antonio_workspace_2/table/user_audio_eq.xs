// User equalizer settings, playback state, and device profile preferences
table user_audio_eq {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Owner user account
    int user_id {
      table = "user"
    }
  
    // Active equalizer sound preset
    enum active_preset?=electronic_cyber {
      values = [
        "electronic_cyber"
        "bass_boost"
        "vocal_clarity"
        "esports_focus"
        "flat"
        "custom"
      ]
    
    }
  
    // 10-band interactive EQ gain values in dB (32Hz to 16kHz)
    json? eq_bands
  
    // Spectrum visualizer animation style
    enum spectrum_visualizer_mode?=bars {
      values = ["bars", "wave", "circular", "neon_glow"]
    }
  
    // Dedicated low-end bass boost multiplier
    decimal bass_boost_level?
  
    // Spatial 3D audio emulation toggle
    bool is_surround_enabled?
  
    // Master volume level (0 to 100)
    int volume?=80 filters=min:0|max:100
  
    // High-gain volume boost preamp multiplier (1.0 = standard, up to 2.0 = 200% amplifier)
    decimal volume_boost_level?=1 filters=min:1.0|max:2.0
  
    // Current playback transport state: playing, paused, stopped
    enum playback_state?=paused {
      values = ["playing", "paused", "stopped"]
    }
  
    // Audio mute toggle
    bool is_muted?
  
    // Shuffle playlist toggle
    bool is_shuffle?
  
    // Repeat track/playlist toggle
    bool is_repeat?
  
    // Fullscreen theater mode toggle
    bool is_fullscreen?
  
    // Currently playing track reference
    int? current_track_id {
      table = "spectator_audio"
    }
  
    // Active client device profile: desktop, mobile, or console
    enum device_profile?=desktop {
      values = ["desktop", "mobile", "console"]
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "user_id"}]}
    {type: "btree", field: [{name: "device_profile"}]}
  ]
}