// Retrieve active Season 2 title ballot with live vote percentages
query ballot verb=GET {
  api_group = "AGN"

  input {
  }

  stack {
    // Retrieve active season ballot
    db.query season_ballot {
      where = $db.season_ballot.is_active == true
      return = {type: "single"}
    } as $ballot
  
    var $options {
      value = []
    }
  
    conditional {
      if ($ballot != null) {
        db.query season_ballot_option {
          where = $db.season_ballot_option.ballot_id == $ballot.id
          sort = {vote_count: "desc"}
          return = {type: "list"}
        } as $ballot_options
      
        var.update $options {
          value = $ballot_options
        }
      }
    }
  }

  response = {ballot: $ballot, options: $options}
}