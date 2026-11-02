// Player achievement definitions
table achievement {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Unique system key identifier
    text key filters=trim|lower
  
    // Display label
    text label filters=trim
  
    // Emoji or badge icon
    text icon filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "key"}]}
  ]
}