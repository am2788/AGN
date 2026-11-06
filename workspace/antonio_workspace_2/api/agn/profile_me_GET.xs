// Retrieve authenticated caller's profile with authoritative theme and stats
query "profile/me" verb=GET {
  api_group = "AGN"
  auth = "user"

  input {
  }

  stack {
    // Look up profile
    db.query profile {
      where = $db.profile.user_id == $auth.id
      return = {type: "single"}
    } as $user_profile
  
    conditional {
      if ($user_profile == null) {
        db.add profile {
          data = {
            user_id     : $auth.id
            handle      : ("player_" ~ $auth.id)
            display_name: ($auth.name ?? "Player")
            pathway     : "spectator"
            age_band    : "unknown"
            theme_id    : "simple-gold"
          }
        } as $user_profile
      }
    }
  
    // Fetch equipped cosmetics
    db.query user_equipped {
      where = $db.user_equipped.user_id == $auth.id
      return = {type: "single"}
    } as $equipped
  }

  response = {profile: $user_profile, equipped: $equipped}
}