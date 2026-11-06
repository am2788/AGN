// Retrieve message history for a DM thread (enforces membership, excludes held messages)
query "dm/messages" verb=GET {
  api_group = "AGN"
  auth = "user"

  input {
    // Target conversation thread ID
    int thread_id {
      table = "dm_thread"
    }
  }

  stack {
    // Verify caller is a member of this conversation
    db.query dm_thread_member {
      where = $db.dm_thread_member.thread_id == $input.thread_id && $db.dm_thread_member.user_id == $auth.id
      return = {type: "single"}
    } as $membership
  
    precondition ($membership != null) {
      error_type = "accessdenied"
      error = "Access denied: You are not a participant in this conversation."
    }
  
    // Fetch non-held messages only (held messages never leak to client)
    db.query dm_message {
      where = $db.dm_message.thread_id == $input.thread_id && $db.dm_message.is_held == false
      sort = {created_at: "asc"}
      return = {type: "list"}
    } as $messages
  }

  response = {thread_id: $input.thread_id, messages: $messages}
}