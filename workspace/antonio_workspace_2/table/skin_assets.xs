// Theme screen layer assets registry
table skin_assets {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Associated theme key
    text theme_id filters=trim
  
    // Target device: desktop or mobile
    enum device {
      values = ["desk", "mob"]
    }
  
    // Target screen identifier
    text screen filters=trim
  
    // Layer type: full layout or shell container
    enum layer {
      values = ["full", "shell"]
    }
  
    // Asset storage or CDN URL
    text url filters=trim
  
    // Render width in pixels
    int width
  
    // Render height in pixels
    int height
  
    // Whether asset is 4K resolution
    bool is_4k?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {
      type : "btree|unique"
      field: [
        {name: "theme_id"}
        {name: "device"}
        {name: "screen"}
        {name: "layer"}
        {name: "is_4k"}
      ]
    }
  ]
}