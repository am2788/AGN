// Discovery for the 6 continuously running tournaments under the 6,144-player standard joining regional segments
query tournaments verb=GET {
  api_group = "AGN"

  input {
  }

  stack {
    // Ensure initial Season 1 tournament and regional segment data is seeded
    db.query tournaments {
      return = {type: "count"}
    } as $tournaments_count
  
    conditional {
      if ($tournaments_count == 0) {
        function.run seed_season1_data as $seeded
      }
    }
  
    // Retrieve Season 1 tournament lanes
    db.query tournaments {
      sort = {lane_order: "asc"}
      return = {type: "list"}
    } as $season1_tournaments
  
    // Retrieve regional scheduled segments
    db.query region_segments {
      sort = {id: "asc"}
      return = {type: "list"}
    } as $region_segments
  
    // Maintain backwards compatibility with legacy tournament table
    db.query tournament {
      sort = {id: "asc"}
      return = {type: "list"}
    } as $legacy_tournaments
  }

  response = {
    standard_capacity: 6144
    cadence          : "6-Day Continuous Schedule"
    format_structures: ```
      {
        solo: {
          capacity: 6144,
          unit: "individual entries"
        },
        team_6: {
          capacity: 6144,
          team_size: 6,
          total_teams: 1024,
          unit: "six-player teams"
        },
        zombies_4v4: {
          capacity: 6144,
          team_size: 4,
          total_teams: 1536,
          unit: "four-player teams"
        }
      }
      ```
    tournaments      : $season1_tournaments
    region_segments  : $region_segments
    legacy           : $legacy_tournaments
  }
}