// Discovery for the 6 continuously running tournaments under the 6,144-player standard
query tournaments verb=GET {
  api_group = "AGN"

  input {
  }

  stack {
    // Retrieve all active tournaments
    db.query tournament {
      sort = {id: "asc"}
      return = {type: "list"}
    } as $tournaments
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
    tournaments      : $tournaments
  }
}