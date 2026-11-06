// Send a friend request, automatically ensuring AGN official friendship and welcome message are initialized
query "friend/request" verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Target user to add as friend
    int recipient_id {
      table = "user"
    }
  }

  stack {
    // Cannot send friend request to self
    precondition ($auth.id != $input.recipient_id) {
      error_type = "inputerror"
      error = "Cannot send a friend request to yourself."
    }
  
    // Automatically seed AETHER as first friend and inject welcome message
    function.run ensure_agn_onboarding {
      input = {user_id: $auth.id}
    } as $caller_agn_onboard
  
    // Verify recipient user exists
    db.get user {
      field_name = "id"
      field_value = $input.recipient_id
    } as $recipient_user
  
    precondition ($recipient_user != null) {
      error_type = "notfound"
      error = "Recipient user not found."
    }
  
    // Ensure recipient also has AETHER initialized
    function.run ensure_agn_onboarding {
      input = {user_id: $input.recipient_id}
    } as $recipient_agn_onboard
  
    // Check if friendship or request already exists
    db.query friendship {
      where = ($db.friendship.requester_id == $auth.id && $db.friendship.recipient_id == $input.recipient_id) || ($db.friendship.requester_id == $input.recipient_id && $db.friendship.recipient_id == $auth.id)
      return = {type: "single"}
    } as $existing_friendship
  
    conditional {
      if ($existing_friendship != null) {
        // If pending from the other user, automatically accept it
        conditional {
          if ($existing_friendship.requester_id == $input.recipient_id && $existing_friendship.status == "pending") {
            db.edit friendship {
              field_name = "id"
              field_value = $existing_friendship.id
              data = {status: "accepted"}
            } as $accepted
          
            var $result {
              value = {
                success   : true
                status    : "accepted"
                friendship: $accepted
              }
            }
          }
        
          else {
            var $result {
              value = {
                success   : true
                status    : $existing_friendship.status
                friendship: $existing_friendship
              }
            }
          }
        }
      }
    
      else {
        // Create new pending friendship request
        db.add friendship {
          data = {
            requester_id: $auth.id
            recipient_id: $input.recipient_id
            status      : "pending"
          }
        } as $new_friendship
      
        var $result {
          value = {
            success   : true
            status    : "pending"
            friendship: $new_friendship
          }
        }
      }
    }
  }

  response = $result
}