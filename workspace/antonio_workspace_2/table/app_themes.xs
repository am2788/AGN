// Application themes catalog
table app_themes {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Theme identifier key: simple-gold, simple-neon, skin-gold, skin-redneon, skin-blueneon, skin-cyber
    text theme_id filters=trim
  
    // Theme kind: simple or skin
    enum kind {
      values = ["simple", "skin"]
    }
  
    // Human-readable theme label
    text label filters=trim
  
    // Whether theme is enabled for selection
    bool enabled?=true
  
    // Whether this is the default theme (skin-gold is the sole true default)
    bool is_default?
  
    // Display sorting order
    int sort?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "theme_id"}]}
    {type: "btree", field: [{name: "enabled"}]}
    {type: "btree", field: [{name: "sort"}]}
  ]
}