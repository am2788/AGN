// Create a new competitive 6-man team roster
query teams_create verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Team display name
    text name filters=trim
  
    // Short team tag (e.g. AGN, CLOUD)
    text tag filters=trim|upper
  
    // Tournament bracket being entered
    int tournament_id {
      table = "tournament"
    }
  }

  stack {
    // First Strike bonus is awarded exclusively upon verified slot purchase via claim_first_strike
    var $is_team_first_strike {
      value = false
    }
  
    // Generate unique team invite code
    var $invite_code {
      value = "AGN-" ~ ($input.tag) ~ "-" ~ (""|uuid|substr:0:6|to_upper)
    }
  
    // Create team
    db.add team {
      data = {
        name            : $input.name
        tag             : $input.tag
        captain_user_id : $auth.id
        invite_code     : $invite_code
        has_first_strike: $is_team_first_strike
      }
    } as $team
  
    // Add captain as first roster member
    db.add team_member {
      data = {
        team_id: $team.id
        user_id: $auth.id
        role   : "captain"
      }
    } as $captain_member
  
    // Create tournament bracket entry for the team
    db.add tournament_entry {
      data = {
        tournament_id : $input.tournament_id
        user_id       : $auth.id
        team_id       : $team.id
        entry_type    : "team"
        payment_status: "pending"
        status        : "registered"
      }
    } as $entry
  }

  response = {
    team                : $team
    captain             : $captain_member
    entry               : $entry
    first_strike_awarded: $is_team_first_strike
  }
}