// Games featured in the tournament series
table game {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Name of the featured game
    text name filters=trim
  
    // Slug identifier for URLs and keys
    text slug filters=trim|lower
  
    // Active status for current season
    bool is_active?=true
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "slug"}]}
  ]
}