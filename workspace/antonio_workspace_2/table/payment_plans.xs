// User tournament entry payment plans
table payment_plans {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // User participating in payment plan
    int user_id {
      table = "user"
    }
  
    // Associated tournament identifier
    int tournament_id
  
    // Payment plan type: full upfront or weekly installments
    enum plan_type {
      values = ["full", "weekly"]
    }
  
    // Number of weekly installments paid to date
    int installments_paid?
  
    // Next scheduled payment timestamp
    timestamp? next_due_at
  
    // Payment plan status (status changes ONLY via verified Stripe webhook)
    enum status?=active {
      values = ["active", "defaulted", "complete"]
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "user_id"}]}
    {type: "btree", field: [{name: "tournament_id"}]}
    {type: "btree", field: [{name: "status"}]}
  ]
}