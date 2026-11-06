// Follow a player profile
query follow verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Target user to follow
    int following_id {
      table = "user"
    }
  }

  stack {
    precondition ($auth.id != $input.following_id) {
      error_type = "inputerror"
      error = "You cannot follow yourself."
    }
  
    // Check if already following
    db.query follow {
      where = $db.follow.follower_id == $auth.id && $db.follow.following_id == $input.following_id
      return = {type: "single"}
    } as $existing_follow
  
    conditional {
      if ($existing_follow == null) {
        db.add follow {
          data = {follower_id: $auth.id, following_id: $input.following_id}
        } as $new_follow
      
        var $result {
          value = {following: true, record: $new_follow}
        }
      }
    
      else {
        var $result {
          value = {following: true, record: $existing_follow}
        }
      }
    }
  }

  response = $result
}