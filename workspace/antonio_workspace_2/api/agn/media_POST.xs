// Add custom audio track or stream link to spectator dashboard media player
query media verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Audio track title or station name
    text title filters=trim
  
    // Audio URL (uploaded MP3/WAV link or external stream iframe source)
    text source_url filters=trim
  
    // Source format: upload or external_stream
    text audio_type?=external_stream
  }

  stack {
    // Add track to spectator player playlist
    db.add spectator_audio {
      data = {
        user_id   : $auth.id
        title     : $input.title
        source_url: $input.source_url
        audio_type: $input.audio_type
      }
    } as $track
  }

  response = {success: true, track: $track}
}