// The Shield hardware and wired network verification scanner
table shield_checkin {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Checked-in user
    int user_id {
      table = "user"
    }
  
    // Associated tournament
    int tournament_id {
      table = "tournament"
    }
  
    // Unique client hardware fingerprint
    text hardware_fingerprint filters=trim
  
    // Detected client network adapter type
    enum connection_type {
      values = ["wired", "wifi", "cellular", "unknown"]
    }
  
    // Measured network jitter in milliseconds
    decimal jitter_ms
  
    // Measured round-trip ping in milliseconds
    decimal ping_ms
  
    // Measured packet loss percentage
    decimal packet_loss_pct
  
    // Integrity scan outcome: passed or booted
    enum status {
      values = ["passed", "booted"]
    }
  
    // Reason given if player was booted by The Shield
    text? boot_reason
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "user_id"}]}
    {type: "btree", field: [{name: "tournament_id"}]}
    {type: "btree", field: [{name: "status"}]}
  ]
}