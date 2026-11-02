// Send a message to the 24/7 Overchat network (Page 42) from registered platform members
query overchat_send verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Target chat channel
    text channel?=global filters=trim
  
    // Message body text
    text message filters=trim
  
    // Originating platform skin (agn, asn, topgamer)
    text platform_origin?=agn
  
    // External streaming feed source: agn, meta, twitch, or youtube
    text external_source?=agn
  }

  stack {
    // Ensure sender is a registered user on our platform
    db.get user {
      field_name = "id"
      field_value = $auth.id
    } as $user
  
    precondition ($user != null) {
      error_type = "accessdenied"
      error = "You must be registered on our platform to participate in Overchat."
    }
  
    precondition (($input.message|strlen) > 0) {
      error_type = "inputerror"
      error = "Message body cannot be empty."
    }
  
    // Insert message into Overchat ledger
    db.add overchat_message {
      data = {
        user_id        : $auth.id
        platform_origin: $input.platform_origin
        channel        : $input.channel
        message        : $input.message
        external_source: $input.external_source
        is_pinned      : false
        is_moderated   : true
      }
    } as $new_message
  }

  response = {
    success: true
    message: $new_message
    author : ```
      {
        id: $user.id,
        name: $user.name,
        calling_card: $user.calling_card,
        pathway: $user.pathway
      }
      ```
  }
}