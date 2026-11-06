// Ensure official AGN account is seeded as user's first friend and welcome message injected
// Automatically seeds AGN official account as the user's first accepted friend and injects the official welcome message if not already present
function ensure_agn_onboarding {
  input {
    // User account ID to onboard
    int user_id
  }

  stack {
    var $agn_id {
      value = 1
    }
  
    // Ensure AGN official user exists in database
    db.get user {
      field_name = "id"
      field_value = $agn_id
    } as $agn_user
  
    conditional {
      if ($agn_user == null) {
        db.add user {
          data = {
            id                  : 1
            name                : "AGN (Aether)"
            email               : "aether@agn.gg"
            role                : "admin"
            calling_card        : "first_strike"
            has_first_strike    : true
            is_wired_verified   : true
            kyc_status          : "approved"
            security_check_state: "green"
          }
        } as $created_agn
      
        db.add profile {
          data = {
            user_id     : 1
            handle      : "agn"
            display_name: "AGN (Aether)"
            pathway     : "competitor"
            age_band    : "18+"
            theme_id    : "skin-gold"
          }
        } as $created_agn_profile
      }
    }
  
    // Check if friendship with AGN exists
    db.query friendship {
      where = ($db.friendship.requester_id == $agn_id && $db.friendship.recipient_id == $input.user_id) || ($db.friendship.requester_id == $input.user_id && $db.friendship.recipient_id == $agn_id)
      return = {type: "single"}
    } as $existing_friendship
  
    conditional {
      if ($existing_friendship == null) {
        db.add friendship {
          data = {
            requester_id: $agn_id
            recipient_id: $input.user_id
            status      : "accepted"
          }
        } as $new_friendship
      }
    
      else {
        conditional {
          if ($existing_friendship.status != "accepted") {
            db.edit friendship {
              field_name = "id"
              field_value = $existing_friendship.id
              data = {status: "accepted"}
            } as $updated_friendship
          }
        }
      }
    }
  
    // Check if official welcome thread exists for this user
    db.query dm_thread_member {
      join = {
        dm_thread: {
          table: "dm_thread"
          where: $db.dm_thread_member.thread_id == $db.dm_thread.id && $db.dm_thread.is_official_welcome == true
        }
      }
    
      where = $db.dm_thread_member.user_id == $input.user_id
      return = {type: "single"}
    } as $existing_membership
  
    var $thread_id {
      value = null
    }
  
    conditional {
      if ($existing_membership != null) {
        var.update $thread_id {
          value = $existing_membership.thread_id
        }
      }
    
      else {
        db.add dm_thread {
          data = {
            is_group           : false
            name               : "AGN Official Welcome"
            is_official_welcome: true
          }
        } as $new_thread
      
        var.update $thread_id {
          value = $new_thread.id
        }
      
        db.add dm_thread_member {
          data = {thread_id: $new_thread.id, user_id: $input.user_id}
        } as $m1
      
        db.add dm_thread_member {
          data = {thread_id: $new_thread.id, user_id: $agn_id}
        } as $m2
      }
    }
  
    // Check if welcome message exists in this thread
    db.query dm_message {
      where = $db.dm_message.thread_id == $thread_id && $db.dm_message.is_official_welcome == true
      return = {type: "single"}
    } as $existing_msg
  
    conditional {
      if ($existing_msg == null) {
        db.add dm_message {
          data = {
            thread_id          : $thread_id
            sender_id          : $agn_id
            body               : "Greetings from Aether and the entire AGN team. We express our deepest gratitude to you for joining us at the dawn of Season 1. Step into the arena, configure your loadout, and rise to glory."
            is_held            : false
            hold_reason        : null
            is_official_welcome: true
          }
        } as $welcome_msg
      }
    }
  }

  response = {success: true, thread_id: $thread_id}
}