// Structured 8-week installment plans for tournament entry fees
table payment_plan {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Payer user account
    int user_id {
      table = "user"
    }
  
    // Associated tournament entry
    int tournament_entry_id {
      table = "tournament_entry"
    }
  
    // Weekly installment billing amount
    decimal weekly_amount
  
    // Total scheduled installment weeks
    int total_weeks?=8
  
    // Count of completed installment payments
    int weeks_paid?
  
    // Scheduled next installment payment timestamp
    timestamp next_due_date
  
    // Active subscription or billing status
    enum status?=active {
      values = ["active", "completed", "past_due", "cancelled"]
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "user_id"}]}
    {type: "btree", field: [{name: "tournament_entry_id"}]}
    {type: "btree", field: [{name: "status"}]}
  ]
}