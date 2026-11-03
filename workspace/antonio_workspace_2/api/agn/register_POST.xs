// Register a new user across Competitor, Wagering, or Spectator pathways with exclusive private stream link
query register verb=POST {
  api_group = "AGN"

  input {
    // Competitor or display name
    text name filters=trim
  
    // User login email
    email email filters=trim|lower
  
    // Mobile phone number (optional)
    text? phone_number filters=trim
  
    // Account password (optional if signing up via Google or Apple OAuth)
    text? password
  
    // Single sign-on authentication provider: email, google, or apple
    text oauth_provider?=email
  
    // External OAuth provider account identifier
    text? oauth_id filters=trim
  
    // Chosen onboarding pathway: competitor, wagering, or spectator
    text pathway?=spectator
  
    // Optional Meta handle (Instagram or Facebook)
    text? meta_handle filters=trim
  
    // Optional YouTube channel URL
    text? social_youtube filters=trim
  
    // Optional Twitch channel URL
    text? social_twitch filters=trim
  
    // Optional Spotify artist/profile URL
    text? social_spotify filters=trim
  
    // Client hardware identifier for The Shield
    text? hardware_fingerprint filters=trim
  
    // Optional device ID from client
    text? device_id filters=trim
  
    // Front scan image URL of government-issued ID (for 18+ wagering pathway)
    text? id_front_image filters=trim
  
    // Back scan image URL of government-issued ID (for 18+ wagering pathway)
    text? id_back_image filters=trim
  }

  stack {
    // Check if email is already registered
    db.get user {
      field_name = "email"
      field_value = $input.email
    } as $existing_user
  
    precondition ($existing_user == null) {
      error_type = "inputerror"
      error = "An account with this email is already registered."
    }
  
    // Check if the solo First Strike bonus has already been claimed
    db.query user {
      where = $db.user.has_first_strike == true
      return = {type: "exists"}
    } as $first_strike_claimed
  
    // Determine initial calling card and First Strike status
    var $is_first_strike {
      value = false
    }
  
    var $calling_card {
      value = "starter"
    }
  
    // Award First Strike motion card if this is the first competitor
    conditional {
      if (!$first_strike_claimed && $input.pathway == "competitor") {
        var.update $is_first_strike {
          value = true
        }
      
        var.update $calling_card {
          value = "first_strike"
        }
      }
    
      elseif ($input.pathway == "wagering") {
        var.update $calling_card {
          value = "premium_wagerer"
        }
      }
    }
  
    // Determine KYC status if ID scans are provided upfront
    var $initial_kyc {
      value = "none"
    }
  
    conditional {
      if ($input.id_front_image != null && $input.id_back_image != null) {
        var.update $initial_kyc {
          value = "approved"
        }
      }
    
      elseif ($input.pathway == "wagering") {
        var.update $initial_kyc {
          value = "pending"
        }
      }
    }
  
    // Generate exclusive, non-shareable stream token and key for participant
    var $stream_token {
      value = "STREAM-" ~ (""|uuid|substr:0:12|to_upper)
    }
  
    var $stream_key {
      value = "KEY-" ~ (""|uuid|substr:0:16)
    }
  
    // Create user profile
    db.add user {
      data = {
        name                  : $input.name
        email                 : $input.email
        phone_number          : $input.phone_number
        password              : $input.password
        oauth_provider        : $input.oauth_provider
        oauth_id              : $input.oauth_id
        pathway               : $input.pathway
        meta_handle           : $input.meta_handle
        social_youtube        : $input.social_youtube
        social_twitch         : $input.social_twitch
        social_spotify        : $input.social_spotify
        hardware_fingerprint  : ($input.hardware_fingerprint ?? $input.device_id)
        device_id             : ($input.device_id ?? $input.hardware_fingerprint)
        has_first_strike      : $is_first_strike
        calling_card          : $calling_card
        kyc_status            : $initial_kyc
        id_front_image        : $input.id_front_image
        id_back_image         : $input.id_back_image
        exclusive_stream_token: $stream_token
        exclusive_stream_key  : $stream_key
      }
    } as $new_user
  
    // Provision digital wallet for the user
    db.add wallet {
      data = {
        user_id       : $new_user.id
        balance       : 0
        locked_balance: 0
        currency      : "USD"
      }
    } as $wallet
  
    // Queue Twilio automated notification log if phone number was provided
    conditional {
      if ($input.phone_number != null) {
        db.add twilio_log {
          data = {
            user_id     : $new_user.id
            phone_number: $input.phone_number
            message_type: "checkin_reminder"
            status      : "queued"
          }
        } as $sms_log
      }
    }
  
    // Generate authenticated session token
    security.create_auth_token {
      table = "user"
      extras = {}
      expiration = 86400
      id = $new_user.id
    } as $authToken
  }

  response = {
    auth_token                  : $authToken
    authToken                   : $authToken
    token                       : $authToken
    user                        : ```
      {
        id: $new_user.id,
        name: $new_user.name,
        email: $new_user.email,
        phone_number: $new_user.phone_number,
        oauth_provider: $new_user.oauth_provider,
        pathway: $new_user.pathway,
        kyc_status: $new_user.kyc_status,
        has_first_strike: $new_user.has_first_strike,
        calling_card: $new_user.calling_card
      }
      ```
    exclusive_participant_stream: ```
      {
        stream_token: $stream_token,
        private_stream_url: "https://xr36-ytey-jl5h.n7e.xano.io/api:agn/stream/" ~ $stream_token,
        access_policy: "Exclusive to your account. Sharing is strictly prohibited."
      }
      ```
    wallet                      : $wallet
    welcome_cinematic           : "video cinematic 4375"
  }
}