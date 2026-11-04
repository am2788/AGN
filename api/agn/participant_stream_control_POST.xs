// Participant controls for configuring and toggling their tournament match live stream
query participant_stream_control verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Associated tournament identifier
    int tournament_id {
      table = "tournament"
    }
  
    // Participant's live stream broadcast link (Twitch, YouTube, Kick, or direct RTMP/HLS)
    text live_stream_url filters=trim
  
    // Live broadcast active toggle
    bool is_live_streaming?=true
  }

  stack {
    // Locate the participant's tournament entry
    db.query tournament_entry {
      where = $db.tournament_entry.tournament_id == $input.tournament_id && $db.tournament_entry.user_id == $auth.id
      return = {type: "single"}
    } as $entry
  
    precondition ($entry != null) {
      error_type = "notfound"
      error = "No tournament entry found for this participant."
    }
  
    // Update live match streaming status and URL
    db.edit tournament_entry {
      field_name = "id"
      field_value = $entry.id
      data = {
        live_stream_url  : $input.live_stream_url
        is_live_streaming: $input.is_live_streaming
      }
    } as $updated_entry
  
    // Update player's default streaming URL
    db.edit user {
      field_name = "id"
      field_value = $auth.id
      data = {primary_stream_url: $input.live_stream_url}
    } as $updated_user
  }

  response = {
    success         : true
    message         : "Tournament match stream link updated successfully."
    entry           : $updated_entry
    stream_watch_url: $updated_entry.live_stream_url
    is_live         : $updated_entry.is_live_streaming
  }
}