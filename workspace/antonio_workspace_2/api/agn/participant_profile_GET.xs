// Click a participant's profile to view their details, watch their stream, or return to the main live broadcast
query participant_profile verb=GET {
  api_group = "AGN"

  input {
    // Participant user identifier
    int user_id {
      table = "user"
    }
  
    // Associated tournament identifier
    int? tournament_id {
      table = "tournament"
    }
  }

  stack {
    // Retrieve participant user profile
    db.get user {
      field_name = "id"
      field_value = $input.user_id
    } as $user
  
    precondition ($user != null) {
      error_type = "notfound"
      error = "Participant not found."
    }
  
    // Retrieve active tournament entry if tournament specified or find recent active entry
    db.query tournament_entry {
      where = $db.tournament_entry.user_id == $input.user_id && $db.tournament_entry.tournament_id ==? $input.tournament_id
      sort = {id: "desc"}
      return = {type: "single"}
    } as $entry
  
    // Retrieve team information if participant is in a team
    var $team {
      value = null
    }
  
    conditional {
      if ($entry != null && $entry.team_id != null) {
        db.get team {
          field_name = "id"
          field_value = $entry.team_id
        } as $team_record
      
        var.update $team {
          value = $team_record
        }
      }
    }
  
    // Determine the active watch link
    var $watch_url {
      value = null
    }
  
    var $is_streaming {
      value = false
    }
  
    conditional {
      if ($entry != null && $entry.live_stream_url != null && $entry.is_live_streaming) {
        var.update $watch_url {
          value = $entry.live_stream_url
        }
      
        var.update $is_streaming {
          value = true
        }
      }
    
      elseif ($user.primary_stream_url != null) {
        var.update $watch_url {
          value = $user.primary_stream_url
        }
      }
    
      elseif ($user.social_twitch != null) {
        var.update $watch_url {
          value = $user.social_twitch
        }
      }
    
      elseif ($user.social_youtube != null) {
        var.update $watch_url {
          value = $user.social_youtube
        }
      }
    }
  
    // Retrieve the main live broadcast for the instant return-to-main-live control
    db.query broadcast_session {
      where = $db.broadcast_session.status != "rerun"
      sort = {created_at: "desc"}
      return = {type: "single"}
    } as $main_live
  
    var $main_stream_url {
      value = "https://xr36-ytey-jl5h.n7e.xano.io/api:agn/broadcast_hud"
    }
  
    conditional {
      if ($main_live != null && $main_live.stream_url != null) {
        var.update $main_stream_url {
          value = $main_live.stream_url
        }
      }
    }
  }

  response = {
    participant                : ```
      {
        id: $user.id,
        name: $user.name,
        pathway: $user.pathway,
        calling_card: $user.calling_card,
        has_first_strike: $user.has_first_strike,
        is_wired_verified: $user.is_wired_verified,
        social_twitch: $user.social_twitch,
        social_youtube: $user.social_youtube,
        primary_stream_url: $user.primary_stream_url
      }
      ```
    tournament_status          : ```
      {
        entry: $entry,
        team: $team
      }
      ```
    stream_watch_control       : ```
      {
        has_active_stream: $is_streaming,
        watch_match_url: $watch_url,
        action_label: "Watch Participant Match"
      }
      ```
    return_to_main_live_control: ```
      {
        button_label: "Return to Main Live Commentary",
        main_broadcast_url: $main_stream_url,
        commentary_channel: "ASN Live Commentary Desk",
        action: "switch_to_main_live"
      }
      ```
  }
}