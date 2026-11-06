// Signup, create profile, and issue HttpOnly cookie-secured session token
query "auth/signup" verb=POST {
  api_group = "Authentication"

  input {
    // User display name
    text? name?
  
    // User email address
    text? email? filters=trim|lower
  
    // User account password
    text? password?
  
    // Mobile phone number (optional)
    text? phone_number? filters=trim
  
    // Optional device ID from client
    text? device_id? filters=trim
  
    // Client hardware identifier for The Shield
    text? hardware_fingerprint? filters=trim
  
    // Front scan image URL of government-issued ID
    text? id_front_image? filters=trim
  
    // Back scan image URL of government-issued ID
    text? id_back_image? filters=trim
  
    // Chosen pathway: competitor, wagerer, spectator
    text? pathway? filters=trim|lower
  
    // Desired unique handle/slug
    text? handle? filters=trim|lower
  }

  stack {
    // Look up existing user by email
    db.query user {
      where = $db.user.email == $input.email
      return = {type: "single"}
      output = ["id"]
    } as $user
  
    // Ensure account is not already registered, returning 400 Bad Request if taken
    precondition ($user == null) {
      error_type = "inputerror"
      error = "This account is already in use."
    }
  
    // Validate pathway selection
    var $chosen_pathway {
      value = "spectator"
    }
  
    conditional {
      if ($input.pathway == "competitor" || $input.pathway == "wagerer" || $input.pathway == "spectator") {
        var.update $chosen_pathway {
          value = $input.pathway
        }
      }
    }
  
    // Insert new user record
    db.add user {
      enforce_hidden_fields = false
      data = {
        created_at          : "now"
        name                : $input.name
        email               : $input.email
        password            : $input.password
        phone_number        : $input.phone_number
        pathway             : $chosen_pathway
        device_id           : ($input.device_id ?? $input.hardware_fingerprint)
        hardware_fingerprint: ($input.hardware_fingerprint ?? $input.device_id)
        id_front_image      : $input.id_front_image
        id_back_image       : $input.id_back_image
      }
    } as $user
  
    // Provision digital wallet for the user
    db.add wallet {
      data = {
        user_id       : $user.id
        balance       : 0
        locked_balance: 0
        currency      : "USD"
      }
    } as $wallet
  
    // Provision authoritative profile record with default theme simple-gold
    var $user_handle {
      value = ($input.handle ?? ("player_" ~ ($user.id|to_text)))
    }
  
    var $display_name {
      value = ($input.name ?? ("Player " ~ ($user.id|to_text)))
    }
  
    db.add profile {
      data = {
        user_id     : $user.id
        handle      : $user_handle
        display_name: $display_name
        pathway     : $chosen_pathway
        age_band    : "unknown"
        theme_id    : "simple-gold"
      }
    } as $profile
  
    // Pre-provision AETHER as the user's default first friend with official welcome message
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
    profile   : $profile
  }
}