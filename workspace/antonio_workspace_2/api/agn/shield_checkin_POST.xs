// The Shield hardware and wired line integrity check-in scanner
query shield_checkin verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Tournament being checked into
    int? tournament_id? {
      table = "tournament"
    }
  
    // Optional match lobby identifier
    int? match_id?
  
    // Client device hardware fingerprint
    text hardware_fingerprint filters=trim
  
    // Detected client network adapter connection type
    text connection_type
  
    // Measured jitter in milliseconds
    decimal jitter_ms
  
    // Measured round-trip ping latency in milliseconds
    decimal ping_ms?=15
  
    // Measured packet loss percentage
    decimal packet_loss_pct?
  
    // Regional edge server cluster
    text? edge_server? filters=trim
  }

  stack {
    // Check if player has an active tournament entry
    var $entry {
      value = null
    }
  
    conditional {
      if ($input.tournament_id != null) {
        db.query tournament_entry {
          where = $db.tournament_entry.tournament_id == $input.tournament_id && $db.tournament_entry.user_id == $auth.id
          return = {type: "single"}
        } as $found_entry
      
        var.update $entry {
          value = $found_entry
        }
      }
    }
  
    // Evaluate connection integrity: 100% wired Ethernet, low jitter, low packet loss
    var $is_violation {
      value = false
    }
  
    var $boot_reason {
      value = null
    }
  
    var $link_type {
      value = "ethernet"
    }
  
    var $shield_result {
      value = "pass"
    }
  
    // Check Wi-Fi or wireless connection
    var $conn_lower {
      value = $input.connection_type|to_lower
    }
  
    var $is_wifi {
      value = (($conn_lower|contains:"wifi") || ($conn_lower|contains:"wi-fi") || ($conn_lower|contains:"wireless") || ($conn_lower != "wired" && $conn_lower != "ethernet"))
    }
  
    conditional {
      if ($is_wifi) {
        var.update $is_violation {
          value = true
        }
      
        var.update $link_type {
          value = "wifi"
        }
      
        var.update $shield_result {
          value = "boot"
        }
      
        var.update $boot_reason {
          value = "Wi-Fi or wireless adapter detected. The Shield strictly requires 100% wired Ethernet."
        }
      }
    
      elseif ($input.jitter_ms > 20) {
        var.update $is_violation {
          value = true
        }
      
        var.update $shield_result {
          value = "boot"
        }
      
        var.update $boot_reason {
          value = "High network jitter detected. Line stability requirement failed."
        }
      }
    
      elseif ($input.packet_loss_pct > 1) {
        var.update $is_violation {
          value = true
        }
      
        var.update $shield_result {
          value = "boot"
        }
      
        var.update $boot_reason {
          value = "Packet loss exceeds maximum 1.0% threshold."
        }
      }
    }
  
    // Record telemetry in shield_checkins table
    db.add shield_checkins {
      data = {
        user_id    : $auth.id
        match_id   : $input.match_id
        link_type  : $link_type
        jitter_ms  : $input.jitter_ms
        edge_server: ($input.edge_server ?? "edge-na-east-1")
        result     : $shield_result
      }
    } as $checkins_log
  
    // Record in legacy shield_checkin table
    db.add shield_checkin {
      data = {
        user_id             : $auth.id
        tournament_id       : ($input.tournament_id ?? 1)
        hardware_fingerprint: $input.hardware_fingerprint
        connection_type     : ($link_type == "ethernet" ? "wired" : "wifi")
        jitter_ms           : $input.jitter_ms
        ping_ms             : $input.ping_ms
        packet_loss_pct     : $input.packet_loss_pct
        status              : ($is_violation ? "booted" : "passed")
        boot_reason         : $boot_reason
      }
    } as $checkin_record
  
    // Process pass or auto-boot
    conditional {
      if ($is_violation) {
        // Revoke user wired status
        db.edit user {
          field_name = "id"
          field_value = $auth.id
          data = {is_wired_verified: false}
        } as $revoked_user
      
        // Auto-boot forfeit from tournament entry if registered
        conditional {
          if ($entry != null) {
            db.edit tournament_entry {
              field_name = "id"
              field_value = $entry.id
              data = {status: "eliminated"}
            } as $booted_entry
          }
        }
      
        var $result {
          value = {
            passed   : false
            status   : "booted"
            result   : "boot"
            link_type: $link_type
            reason   : $boot_reason
            shield_id: $checkins_log.id
          }
        }
      }
    
      else {
        // Update user wired verification and hardware fingerprint
        db.edit user {
          field_name = "id"
          field_value = $auth.id
          data = {
            is_wired_verified   : true
            hardware_fingerprint: $input.hardware_fingerprint
          }
        } as $updated_user
      
        // Update tournament entry to checked_in status if registered
        conditional {
          if ($entry != null) {
            db.edit tournament_entry {
              field_name = "id"
              field_value = $entry.id
              data = {status: "checked_in"}
            } as $checked_in_entry
          }
        }
      
        var $result {
          value = {
            passed   : true
            status   : "passed"
            result   : "pass"
            link_type: $link_type
            reason   : "The Shield integrity cleared. 100% wired Ethernet verified."
            shield_id: $checkins_log.id
          }
        }
      }
    }
  }

  response = $result
}