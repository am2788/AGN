// Join a competitive team roster using an invite code
query teams_join verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Secret team roster invite code
    text invite_code filters=trim
  }

  stack {
    // Lookup team by invite code
    db.query team {
      where = $db.team.invite_code == $input.invite_code
      return = {type: "single"}
    } as $team
  
    // Validate that team exists
    precondition ($team != null) {
      error_type = "notfound"
      error = "Invalid team invite code."
    }
  
    // Check if user is already a member of this team
    db.query team_member {
      where = $db.team_member.team_id == $team.id && $db.team_member.user_id == $auth.id
      return = {type: "exists"}
    } as $already_member
  
    precondition (!$already_member) {
      error_type = "inputerror"
      error = "You are already a member of this roster."
    }
  
    // Count existing members (strict 6-player roster limit)
    db.query team_member {
      where = $db.team_member.team_id == $team.id
      return = {type: "count"}
    } as $member_count
  
    precondition ($member_count < 6) {
      error_type = "inputerror"
      error = "Roster is already full (maximum 6 players: 5 starters + 1 substitute/coach)."
    }
  
    // Add user as roster member
    db.add team_member {
      data = {team_id: $team.id, user_id: $auth.id, role: "member"}
    } as $new_member
  }

  response = {success: true, team: $team, member: $new_member}
}