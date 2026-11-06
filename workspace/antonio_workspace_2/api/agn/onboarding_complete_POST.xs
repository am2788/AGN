// Complete onboarding with official AGN welcome quote, friendship, and default skin-gold theme
query "onboarding/complete" verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Optional desired user handle/slug
    text? handle? filters=trim|lower
  
    // Optional display name
    text? display_name? filters=trim
  }

  stack {
    // Immutable official AGN system account ID
    var $agn_official_id {
      value = 1
    }
  
    // Ensure official AGN account exists in user table
    db.get user {
      field_name = "id"
      field_value = $agn_official_id
    } as $agn_user
  
    conditional {
      if ($agn_user == null) {
        db.add user {
          data = {
            id        : 1
            name      : "AGN Official"
            email     : "official@agn.gg"
            role      : "admin"
            is_active : true
            created_at: "now"
          }
        } as $created_agn_user
      }
    }
  
    // Idempotently create or update accepted friendship with AGN official account
    db.query friendship {
      where = ($db.friendship.requester_id == $agn_official_id && $db.friendship.recipient_id == $auth.id) || ($db.friendship.requester_id == $auth.id && $db.friendship.recipient_id == $agn_official_id)
      return = {type: "single"}
    } as $existing_friendship
  
    conditional {
      if ($existing_friendship == null) {
        db.add friendship {
          data = {
            requester_id: $agn_official_id
            recipient_id: $auth.id
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
  
    // Find existing official welcome thread for caller
    db.query dm_thread_member {
      join = {
        dm_thread: {
          table: "dm_thread"
          where: $db.dm_thread_member.thread_id == $db.dm_thread.id && $db.dm_thread.is_official_welcome == true
        }
      }
    
      where = $db.dm_thread_member.user_id == $auth.id
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
        // Create new official welcome thread
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
      
        // Add member entries for caller and AGN official account
        db.add dm_thread_member {
          data = {thread_id: $new_thread.id, user_id: $auth.id}
        } as $m1
      
        db.add dm_thread_member {
          data = {thread_id: $new_thread.id, user_id: $agn_official_id}
        } as $m2
      }
    }
  
    // Check if official welcome quote was already posted to this thread
    db.query dm_message {
      where = $db.dm_message.thread_id == $thread_id && $db.dm_message.is_official_welcome == true
      return = {type: "single"}
    } as $existing_welcome_msg
  
    conditional {
      if ($existing_welcome_msg == null) {
        db.add dm_message {
          data = {
            thread_id          : $thread_id
            sender_id          : $agn_official_id
            body               : "Greetings from Aether and the entire AGN team. We express our deepest gratitude to you for joining us at the dawn of Season 1. Step into the arena, configure your loadout, and rise to glory."
            is_held            : false
            hold_reason        : null
            is_official_welcome: true
          }
        } as $welcome_msg
      }
    }
  
    // Look up caller profile
    db.query profile {
      where = $db.profile.user_id == $auth.id
      return = {type: "single"}
    } as $user_profile
  
    var $theme_id {
      value = "skin-gold"
    }
  
    conditional {
      if ($user_profile == null) {
        // Generate default handle if not provided
        var $default_handle {
          value = ($input.handle ?? ("user_" ~ $auth.id))
        }
      
        var $default_display {
          value = ($input.display_name ?? ($auth.name ?? "Competitor"))
        }
      
        db.add profile {
          data = {
            user_id     : $auth.id
            handle      : $default_handle
            display_name: $default_display
            pathway     : "spectator"
            age_band    : "unknown"
            theme_id    : "skin-gold"
          }
        } as $new_profile
      
        var.update $theme_id {
          value = "skin-gold"
        }
      }
    
      else {
        conditional {
          if ($user_profile.theme_id == null || $user_profile.theme_id == "") {
            db.edit profile {
              field_name = "id"
              field_value = $user_profile.id
              data = {theme_id: "skin-gold"}
            } as $updated_profile
          
            var.update $theme_id {
              value = "skin-gold"
            }
          }
        
          else {
            var.update $theme_id {
              value = $user_profile.theme_id
            }
          }
        }
      }
    }
  }

  response = {thread_id: $thread_id, theme_id: $theme_id}
}