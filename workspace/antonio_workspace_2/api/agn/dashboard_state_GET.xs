// Fetch unified dashboard state for Lovable React frontend
query dashboard_state verb=GET {
  api_group = "AGN"

  input {
  }

  stack {
    // Check if the 1-of-1 First Strike calling card has been claimed for solo
    db.query user {
      where = $db.user.has_first_strike == true
      return = {type: "exists"}
    } as $solo_first_strike_claimed
  
    // Check if the 1-of-1 First Strike calling card has been claimed for teams
    db.query team {
      where = $db.team.has_first_strike == true
      return = {type: "exists"}
    } as $team_first_strike_claimed
  
    // Get current progressive jackpot vault total
    db.query jackpot_vault {
      where = $db.jackpot_vault.status == "active"
      return = {type: "single"}
    } as $jackpot
  
    // Get active tournaments
    db.query tournament {
      where = $db.tournament.status == "registration_open"
      return = {type: "list"}
    } as $tournaments
  
    // Get active games
    db.query game {
      where = $db.game.is_active == true
      return = {type: "list"}
    } as $games
  }

  response = {
    jackpot_vault       : $jackpot
    first_strike_tracker: ```
      {
        solo_claimed: $solo_first_strike_claimed,
        team_claimed: $team_first_strike_claimed
      }
      ```
    tournaments         : $tournaments
    games               : $games
  }
}