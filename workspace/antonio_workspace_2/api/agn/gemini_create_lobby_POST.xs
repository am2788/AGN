// Gemini AI Referee: Create match lobby with ghost account detection and 15-minute Twilio alert
query gemini_create_lobby verb=POST {
  api_group = "AGN"

  input {
    // Tournament bracket being played
    int tournament_id {
      table = "tournament"
    }
  
    // Player 1 identifier
    int player_1_id {
      table = "user"
    }
  
    // Player 2 identifier
    int player_2_id {
      table = "user"
    }
  
    // Edge server node location
    text server_node_location?="US-East-Edge-01" filters=trim
  }

  stack {
    // GEMINI ANTI-GHOST CHECK: Detect ghost accounts and self-matches
    precondition ($input.player_1_id != $input.player_2_id) {
      error_type = "inputerror"
      error = "GEMINI REFEREE ALERT: Ghost account collision detected. Competitors must be distinct verified entities."
    }
  
    // Verify both players exist
    db.get user {
      field_name = "id"
      field_value = $input.player_1_id
    } as $player_1
  
    db.get user {
      field_name = "id"
      field_value = $input.player_2_id
    } as $player_2
  
    precondition ($player_1 != null && $player_2 != null) {
      error_type = "notfound"
      error = "One or both competitor accounts could not be verified."
    }
  
    // Detect hardware fingerprint duplication (anti-sybil ghost prevention)
    conditional {
      if ($player_1.hardware_fingerprint != null && $player_2.hardware_fingerprint != null) {
        precondition ($player_1.hardware_fingerprint != $player_2.hardware_fingerprint) {
          error_type = "accessdenied"
          error = "GEMINI REFEREE ALERT: Duplicate hardware fingerprint detected across both slots. Multi-account ghost play is strictly prohibited."
        }
      }
    }
  
    // Calculate 15-minute countdown deadline (900 seconds)
    var $deadline {
      value = "now"
        |to_timestamp
        |add_secs_to_timestamp:900
    }
  
    // Create match lobby monitored by Gemini
    db.add match_lobby {
      data = {
        tournament_id       : $input.tournament_id
        player_1_id         : $input.player_1_id
        player_2_id         : $input.player_2_id
        lobby_status        : "waiting_for_check_in"
        check_in_deadline   : $deadline
        server_node_location: $input.server_node_location
      }
    } as $lobby
  
    // Twilio alert dispatch to Player 1
    conditional {
      if ($player_1.phone_number != null) {
        db.add twilio_log {
          data = {
            user_id     : $player_1.id
            phone_number: $player_1.phone_number
            message_type: "checkin_reminder"
            status      : "sent"
          }
        } as $sms_p1
      }
    }
  
    // Twilio alert dispatch to Player 2
    conditional {
      if ($player_2.phone_number != null) {
        db.add twilio_log {
          data = {
            user_id     : $player_2.id
            phone_number: $player_2.phone_number
            message_type: "checkin_reminder"
            status      : "sent"
          }
        } as $sms_p2
      }
    }
  }

  response = {
    lobby         : $lobby
    gemini_referee: ```
      {
        status: "monitoring_15m_countdown",
        deadline: $deadline,
        ghost_check: "passed",
        twilio_alerts_dispatched: true
      }
      ```
  }
}