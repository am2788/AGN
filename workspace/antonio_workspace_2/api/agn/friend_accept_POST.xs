// Accept an incoming friendship connection request
query "friend/accept" verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // ID of the requesting user
    int requester_id {
      table = "user"
    }
  }

  stack {
    // Find pending friendship request where caller is recipient
    db.query friendship {
      where = $db.friendship.requester_id == $input.requester_id && $db.friendship.recipient_id == $auth.id && $db.friendship.status == "pending"
      return = {type: "single"}
    } as $pending_req
  
    precondition ($pending_req != null) {
      error_type = "notfound"
      error = "Pending friend request not found."
    }
  
    // Update status to accepted
    db.edit friendship {
      field_name = "id"
      field_value = $pending_req.id
      data = {status: "accepted"}
    } as $accepted_friendship
  }

  response = {success: true, friendship: $accepted_friendship}
}