// Send direct message with safety age verification and welcome thread reply blocking
query "dm/send" verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Target conversation thread ID
    int thread_id {
      table = "dm_thread"
    }
  
    // Message body text
    text body filters=trim
  }

  stack {
    // Require non-empty message body
    precondition ($input.body != "") {
      error_type = "inputerror"
      error = "Message body cannot be empty."
    }
  
    // Ensure caller has AGN friendship and welcome message initialized
    function.run ensure_agn_onboarding {
      input = {user_id: $auth.id}
    } as $caller_agn_onboard
  
    // Retrieve target thread
    db.get dm_thread {
      field_name = "id"
      field_value = $input.thread_id
    } as $thread
  
    precondition ($thread != null) {
      error_type = "notfound"
      error = "Conversation thread not found."
    }
  
    // Block user replies on the official AGN welcome thread
    precondition ($thread.is_official_welcome == false || $auth.role == "admin") {
      error_type = "accessdenied"
      error = "Replies are disabled on the official AGN announcement channel."
    }
  
    // Verify caller is an active member of this thread
    db.query dm_thread_member {
      where = $db.dm_thread_member.thread_id == $input.thread_id && $db.dm_thread_member.user_id == $auth.id
      return = {type: "single"}
    } as $caller_membership
  
    precondition ($caller_membership != null) {
      error_type = "accessdenied"
      error = "You are not a member of this conversation."
    }
  
    // Retrieve all participants in the thread to enforce strict age-band isolation
    db.query dm_thread_member {
      where = $db.dm_thread_member.thread_id == $input.thread_id
      return = {type: "list"}
    } as $all_members
  
    var $has_adult_participant {
      value = false
    }
  
    var $has_minor_or_unknown_participant {
      value = false
    }
  
    // Evaluate all thread participants (excluding official system user 1)
    foreach ($all_members) {
      each as $member {
        conditional {
          if ($member.user_id != 1) {
            db.query profile {
              where = $db.profile.user_id == $member.user_id
              return = {type: "single"}
            } as $member_profile
          
            var $member_age {
              value = ($member_profile.age_band ?? "unknown")
            }
          
            conditional {
              if ($member_age == "18+") {
                var.update $has_adult_participant {
                  value = true
                }
              }
            
              else {
                var.update $has_minor_or_unknown_participant {
                  value = true
                }
              }
            }
          }
        }
      }
    }
  
    // Block execution with 403 Forbidden error immediately if participants bounce between 18+ and 13-17 or unknown
    precondition (!($has_adult_participant && $has_minor_or_unknown_participant)) {
      error_type = "accessdenied"
      error = "Direct messaging between 18+ and 13-17 or unknown profiles is strictly prohibited by safety policy."
    }
  
    // Insert new message
    db.add dm_message {
      data = {
        thread_id          : $input.thread_id
        sender_id          : $auth.id
        body               : $input.body
        is_held            : false
        hold_reason        : null
        is_official_welcome: false
      }
    } as $new_message
  }

  response = {success: true, message: $new_message}
}