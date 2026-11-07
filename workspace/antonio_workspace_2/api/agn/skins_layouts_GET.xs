// Query dynamic UI layout layer coordinates for a specific screen and device
query "skins/layouts" verb=GET {
  api_group = "AGN"

  input {
    // Screen identifier (e.g. home, signup, dashboard, mediadeck)
    text screen filters=trim
  
    // Device form factor: desk or mob
    text device filters=trim
  }

  stack {
    // Query layout record matching screen and device
    db.query ui_layouts {
      where = $db.ui_layouts.screen == $input.screen && $db.ui_layouts.device == $input.device
      return = {type: "single"}
    } as $layout
  
    // Extract layer coordinates or return empty object if unconfigured
    var $coordinates {
      value = ($layout != null ? $layout.layer_coordinates : {})
    }
  }

  response = $coordinates
}