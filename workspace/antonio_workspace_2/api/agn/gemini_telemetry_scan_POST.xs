// Gemini AI Referee: Hardware & network telemetry scan with 15m timeout and Wi-Fi auto-boot
query gemini_telemetry_scan verb=POST {
  api_group = "AGN"

  input {
    // Active match lobby identifier
    int match_id {
      table = "match_lobby"
    }
  
    // Scanning player identifier
    int player_id {
      table = "user"
    }
  
    // Detected hardware network adapter signature
    text connection_adapter filters=trim
  
    // Measured jitter in milliseconds
    decimal packet_jitter_ms
  
    // Measured round-trip ping latency in milliseconds
    decimal ping_latency_ms
  }

  stack {
    // Retrieve match lobby
    db.get match_lobby {
      field_name = "id"
      field_value = $input.match_id
    } as $lobby
  
    precondition ($lobby != null) {
      error_type = "notfound"
      error = "Match lobby not found."
    }
  
    // Determine current timestamp
    var $current_time {
      value = "now"|to_timestamp
    }
  
    var $verdict {
      value = "pass_wired"
    }
  
    var $verdict_message {
      value = "Wired line verified. Gemini referee cleared."
    }
  
    // 1. Check 15-minute countdown clock
    conditional {
      if ($current_time > $lobby.check_in_deadline) {
        var.update $verdict {
          value = "fail_timeout_booted"
        }
      
        var.update $verdict_message {
          value = "15-minute check-in clock expired. Player forfeited by Gemini Referee."
        }
      
        db.edit match_lobby {
          field_name = "id"
          field_value = $lobby.id
          data = {lobby_status: "disqualified"}
        } as $updated_lobby
      }
    
      // 2. Check Wi-Fi / wireless mandate
      elseif (($input.connection_adapter|to_lower|contains:"wi-fi") || ($input.connection_adapter|to_lower|contains:"wireless") || (($input.connection_adapter|to_lower) == "wifi") || ($input.packet_jitter_ms > 20)) {
        var.update $verdict {
          value = "fail_wireless_booted"
        }
      
        var.update $verdict_message {
          value = "GEMINI REFEREE AUTO-BOOT: Wireless adapter or high jitter detected. Strict wired Ethernet requirement failed."
        }
      
        db.edit match_lobby {
          field_name = "id"
          field_value = $lobby.id
          data = {lobby_status: "disqualified"}
        } as $updated_lobby
      }
    
      else {
        // Wired check passed - check if both players are cleared to start match
        db.query referee_telemetry {
          where = $db.referee_telemetry.match_id == $lobby.id && $db.referee_telemetry.telemetry_verdict == "pass_wired"
          return = {type: "count"}
        } as $passed_players_count
      
        // If other player was already cleared, advance lobby to active_match
        conditional {
          if ($passed_players_count >= 1) {
            db.edit match_lobby {
              field_name = "id"
              field_value = $lobby.id
              data = {lobby_status: "active_match"}
            } as $updated_lobby
          }
        }
      }
    }
  
    // Record scan verdict in referee_telemetry
    db.add referee_telemetry {
      data = {
        match_id          : $lobby.id
        player_id         : $input.player_id
        connection_adapter: $input.connection_adapter
        packet_jitter_ms  : $input.packet_jitter_ms
        ping_latency_ms   : $input.ping_latency_ms
        telemetry_verdict : $verdict
      }
    } as $telemetry_record
  }

  response = {
    telemetry     : $telemetry_record
    gemini_verdict: $verdict
    message       : $verdict_message
    match_status  : $lobby.lobby_status
  }
}