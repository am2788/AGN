// Retrieve active themes catalog for Season 1
query themes verb=GET {
  api_group = "AGN"

  input {
  }

  stack {
    // Check if themes need initial seeding
    db.query app_themes {
      return = {type: "count"}
    } as $count
  
    conditional {
      if ($count == 0) {
        function.run seed_season1_data as $seeded
      }
    }
  
    // Fetch all enabled themes
    db.query app_themes {
      where = $db.app_themes.enabled == true
      sort = {sort: "asc"}
      return = {type: "list"}
    } as $themes
  }

  response = {themes: $themes, default: "simple-gold"}
}