// Admin moderation and abuse incident safety queue
query "admin/safety/queue" verb=GET {
  api_group = "AGN"
  auth = "user"

  input {
    // Queue filter status
    text status?=queued filters=trim
  }

  stack {
    // Strictly require admin role
    precondition ($auth.role == "admin") {
      error_type = "accessdenied"
      error = "Administrative access required."
    }
  
    // Retrieve reports in queue
    db.query abuse_reports {
      where = $db.abuse_reports.status == $input.status
      sort = {created_at: "desc"}
      return = {type: "list"}
    } as $reports
  
    // Retrieve flagged accounts
    db.query safety_flags {
      sort = {created_at: "desc"}
      return = {type: "list"}
    } as $flags
  
    // Retrieve held direct messages
    db.query dm_message {
      where = $db.dm_message.is_held == true
      sort = {created_at: "desc"}
      return = {type: "list"}
    } as $held_messages
  }

  response = {
    reports      : $reports
    safety_flags : $flags
    held_messages: $held_messages
  }
}