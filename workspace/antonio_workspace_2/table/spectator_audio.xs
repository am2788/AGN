// Spectator dashboard audio player tracks and external streams
table spectator_audio {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Owner spectator user account
    int user_id {
      table = "user"
    }
  
    // Track title or label
    text title filters=trim
  
    // Audio file URL or external streaming link
    text source_url filters=trim
  
    // Source format: uploaded audio file or external stream URL
    enum audio_type?=upload {
      values = ["upload", "external_stream"]
    }
  
    // Playback display order in user dashboard
    int sort_order?
  
    // Performing artist name
    text? artist filters=trim
  
    // Album title
    text? album filters=trim
  
    // Artist or album artwork image URL
    text? artwork_url filters=trim
  
    // Color-matched UI theme palette extracted from artwork
    json? color_palette
  
    // Streaming provider integration
    enum source_platform?=upload {
      values = [
        "upload"
        "youtube_music"
        "spotify_premium"
        "soundcloud"
        "league_playlist"
      ]
    
    }
  
    // Audio duration in seconds
    int duration_seconds?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "user_id"}]}
    {type: "btree", field: [{name: "source_platform"}]}
  ]
}