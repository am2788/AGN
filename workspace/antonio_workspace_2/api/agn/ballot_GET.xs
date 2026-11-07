// Retrieve active Season 2 title ballot with live vote percentages
query ballot verb=GET {
  api_group = "AGN"

  input {
  }

  stack {
    // Enforce Season 2 democratic voting cutoff: 21 Dec 2026 UTC
    var $cutoff_timestamp {
      value = 1797811200000
    }
  
    var $cutoff_utc {
      value = "2026-12-21T00:00:00Z"
    }
  
    var $is_voting_open {
      value = (now < $cutoff_timestamp)
    }
  
    // Retrieve active Season 2 options
    db.query ballot_options {
      where = $db.ballot_options.season == 2
      sort = {vote_count: "desc"}
      return = {type: "list"}
    } as $ballot_opts
  
    conditional {
      if (($ballot_opts|count) == 0) {
        function.run seed_season1_data as $seeded
        db.query ballot_options {
          where = $db.ballot_options.season == 2
          sort = {vote_count: "desc"}
          return = {type: "list"}
        } as $reloaded_opts
      
        var.update $ballot_opts {
          value = $reloaded_opts
        }
      }
    }
  
    // Calculate total votes
    var $total_votes {
      value = 0
    }
  
    foreach ($ballot_opts) {
      each as $opt {
        var.update $total_votes {
          value = $total_votes + ($opt.vote_count ?? 0)
        }
      }
    }
  
    // Calculate live percentages for each option
    var $formatted_options {
      value = []
    }
  
    foreach ($ballot_opts) {
      each as $opt {
        var $pct {
          value = ($total_votes > 0 ? ((($opt.vote_count ?? 0) * 100) / $total_votes) : 0)
        }
      
        var $opt_entry {
          value = {
            id        : $opt.id
            season    : ($opt.season ?? 2)
            title     : $opt.title
            vote_count: ($opt.vote_count ?? 0)
            percentage: $pct|round:1
          }
        }
      
        var.update $formatted_options {
          value = $formatted_options|push:$opt_entry
        }
      }
    }
  
    // Also fetch legacy season_ballot if present
    db.query season_ballot {
      where = $db.season_ballot.is_active == true
      return = {type: "single"}
    } as $legacy_ballot
  }

  response = {
    season          : 2
    cutoff_utc      : $cutoff_utc
    cutoff_timestamp: $cutoff_timestamp
    is_voting_open  : $is_voting_open
    total_votes     : $total_votes
    options         : $formatted_options
    ballot          : $legacy_ballot
  }
}