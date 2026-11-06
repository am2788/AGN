// Login, issue HttpOnly cookie-secured session token, and return authenticated profile
query "auth/login" verb=POST {
  api_group = "Authentication"

  input {
    // User email address
    text email filters=trim|lower
  
    // User account password
    text password
  }

  stack {
    // Validate email and password are provided and non-empty
    precondition ($input.email != "" && $input.password != "") {
      error_type = "inputerror"
      error = "Invalid credentials"
    }
  
    // Look up user record by email
    db.query user {
      where = $db.user.email == $input.email
      return = {type: "single"}
      output = ["id", "created_at", "name", "email", "password"]
    } as $user
  
    // Ensure user was found, otherwise return 400 Bad Request
    precondition ($user != null) {
      error_type = "inputerror"
      error = "Invalid credentials"
    }
  
    // Verify input password against stored hash
    security.check_password {
      text_password = ($input.password ?? "")
      hash_password = $user.password
    } as $pass_result
  
    // Ensure password matches, otherwise return 400 Bad Request
    precondition ($pass_result) {
      error_type = "inputerror"
      error = "Invalid credentials"
    }
  
    // Fetch user profile
    db.query profile {
      where = $db.profile.user_id == $user.id
      return = {type: "single"}
    } as $user_profile
  
    // Auto-provision profile with default simple-gold if missing
    conditional {
      if ($user_profile == null) {
        db.add profile {
          data = {
            user_id     : $user.id
            handle      : ("player_" ~ ($user.id|to_text))
            display_name: ($user.name ?? ("Player " ~ ($user.id|to_text)))
            pathway     : "spectator"
            age_band    : "unknown"
            theme_id    : "simple-gold"
          }
        } as $user_profile
      }
    }
  
    // Ensure AGN friendship and welcome message are initialized
    function.run ensure_agn_onboarding {
      input = {user_id: $user.id}
    } as $agn_onboarding
  
    // Generate authenticated session token
    security.create_auth_token {
      table = "user"
      extras = {}
      expiration = 86400
      id = $user.id
    } as $authToken
  
    // Issue HttpOnly cookie-secured session token header
    util.set_header {
      value = "Set-Cookie: token=" ~ $authToken ~ "; HttpOnly; Secure; SameSite=Lax; Path=/"
      duplicates = "replace"
    }
  }

  response = {
    authToken : $authToken
    token     : $authToken
    auth_token: $authToken
    user      : ```
      {
        id: $user.id,
        name: $user.name,
        email: $user.email
      }
      ```
    profile   : $user_profile
  }
}