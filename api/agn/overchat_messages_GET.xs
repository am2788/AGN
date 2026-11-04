// Retrieve 24/7 Overchat messages (Page 42 dashboard reference)
query overchat_messages verb=GET {
  api_group = "AGN"

  input {
    // Chat room or channel identifier
    text channel?=global filters=trim
  
    // Maximum messages to retrieve
    int limit?=50
  }

  stack {
    // Query recent messages for this channel
    db.query overchat_message {
      join = {
        user: {
          table: "user"
          where: $db.overchat_message.user_id == $db.user.id
        }
      }
    
      where = $db.overchat_message.channel == $input.channel && $db.overchat_message.is_moderated == true
      sort = {created_at: "desc"}
      eval = {
        author_name   : $db.user.name
        author_card   : $db.user.calling_card
        author_pathway: $db.user.pathway
      }
    
      return = {type: "list", paging: {page: 1, per_page: $input.limit}}
    } as $messages
  }

  response = {channel: $input.channel, messages: $messages}
}