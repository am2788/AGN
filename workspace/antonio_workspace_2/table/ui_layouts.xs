// Dynamic layout coordinate storage for UI screens across desktop and mobile devices
table ui_layouts {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Screen identifier: home, signup, upcoming, merch, signin, wager, live, overchat, results, dashboard, gateway1, gateway2, gateway3, gateway4, admin, mediadeck, leaderboard, ledger-personal, ledger-admin
    text screen filters=trim
  
    // Target device form factor
    enum device {
      values = ["desk", "mob"]
    }
  
    // Percentage layout arrays and coordinate boundaries
    json layer_coordinates
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "screen"}]}
    {type: "btree", field: [{name: "screen"}, {name: "device"}]}
  ]
}