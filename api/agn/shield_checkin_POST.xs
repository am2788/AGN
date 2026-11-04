// The Shield hardware and wired line integrity check-in scanner
query shield_checkin verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Tournament being checked into
    int tournament_id {
      table = "tournament"
    }
  
    // Client device hardware fingerprint
    text hardware_fingerprint filters=trim
  
    // Detected client network adapter connection type
    text connection_type
  
    // Measured jitter in milliseconds
    decimal jitter_ms
  
    // Measured round-trip ping latency in milliseconds
    decimal ping_ms
  
    // Measured packet loss percentage
    decimal packet_loss_pct
  }

  stack {
    // Check if player has an active tournament entry
    db.query tournament_entry {
      where = $db.tournament_entry.tournament_id == $input.tournament_id && $db.tournament_entry.user_id == $auth.id
      return = {type: "single"}
    } as $entry
  
    // Evaluate connection integrity: 100% wired, low jitter, low packet loss
    var $is_violation {
      value = false
    }
  
    var $boot_reason {
      value = null
    }
  
    conditional {
      if ($input.connection_type != "wired") {
        var.update $is_violation {
          value = true
        }
      
        var.update $boot_reason {
          value = "Wi-Fi or wireless adapter detected. Only 100% wired Ethernet is permitted."
        }
      }
    
      elseif ($input.jitter_ms > 20) {
        var.update $is_violation {
          value = true
        }
      
        var.update $boot_reason {
          value = "High network jitter detected. Line stability requirement failed."
        }
      }
    
      elseif ($input.packet_loss_pct > 1) {
        var.update $is_violation {
          value = true
        }
      
        var.update $boot_reason {
          value = "Packet loss exceeds maximum 1.0% threshold."
        }
      }
    }
  
    // Process pass or auto-boot
    conditional {
      if ($is_violation) {
        // Record booted check-in
        db.add shield_checkin {
          data = {
            user_id             : $auth.id
            tournament_id       : $input.tournament_id
            hardware_fingerprint: $input.hardware_fingerprint
            connection_type     : $input.connection_type
            jitter_ms           : $input.jitter_ms
            ping_ms             : $input.ping_ms
            packet_loss_pct     : $input.packet_loss_pct
            status              : "booted"
            boot_reason         : $boot_reason
          }
        } as $checkin_record
      
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
            reason   : $boot_reason
            shield_id: $checkin_record.id
          }
        }
      }
    
      else {
        // Record passed check-in
        db.add shield_checkin {
          data = {
            user_id             : $auth.id
            tournament_id       : $input.tournament_id
            hardware_fingerprint: $input.hardware_fingerprint
            connection_type     : "wired"
            jitter_ms           : $input.jitter_ms
            ping_ms             : $input.ping_ms
            packet_loss_pct     : $input.packet_loss_pct
            status              : "passed"
            boot_reason         : null
          }
        } as $checkin_record
      
        // Update user wired verification and hardware fingerprint
        db.edit user {
          field_name = "id"
          field_value = $auth.id
          data = {
            is_wired_verified   : true
            hardware_fingerprint: $input.hardware_fingerprint
          }
        } as $updated_user
      
        // Update tournament entry to checked_in status
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
            reason   : "The Shield integrity cleared. 100% wired Ethernet verified."
            shield_id: $checkin_record.id
          }
        }
      }
    }
  }

  response = $result
}