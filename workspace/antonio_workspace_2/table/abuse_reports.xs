// User abuse and incident reports submitted for review
table abuse_reports {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Reporting user ID
    int user_id {
      table = "user"
    }
  
    // Reported offender user ID
    int reported_user_id {
      table = "user"
    }
  
    // Report category reason
    text reason filters=trim
  
    // Incident context and message evidence details
    text? details filters=trim
  
    // Moderation queue status (keep queued until tip-line credentials configured)
    enum status?=queued {
      values = ["queued", "reviewing", "resolved", "dismissed"]
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "user_id"}]}
    {type: "btree", field: [{name: "reported_user_id"}]}
    {type: "btree", field: [{name: "status"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}