// Twilio SMS dispatch logs for alerts, check-ins, and 2FA
table twilio_log {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Recipient user account
    int? user_id {
      table = "user"
    }
  
    // Destination phone number
    text phone_number filters=trim
  
    // Automated notification category
    enum message_type {
      values = [
        "checkin_reminder"
        "shield_warning"
        "payment_receipt"
        "wallet_2fa"
      ]
    
    }
  
    // Dispatch delivery status
    enum status?=queued {
      values = ["queued", "sent", "failed"]
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "user_id"}]}
    {type: "btree", field: [{name: "status"}]}
  ]
}