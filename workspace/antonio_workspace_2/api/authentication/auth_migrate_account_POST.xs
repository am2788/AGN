// Verifies cryptographically signed invite/reset token to link legacy Lovable Cloud/Supabase records to Xano user_id
query "auth/migrate_account" verb=POST {
  api_group = "Authentication"

  input {
    // Cryptographically signed migration token (payload_base64.signature_hex)
    text migration_token filters=trim
  }

  stack {
    // Require non-empty migration token
    precondition ($input.migration_token != "") {
      error_type = "inputerror"
      error = "Migration token is required."
    }
  
    // Split token into base64 payload and cryptographic signature
    var $token_parts {
      value = $input.migration_token|split:"."
    }
  
    // Ensure both payload and signature segments are present
    var $part_count {
      value = $token_parts|count
    }
  
    precondition ($part_count >= 2) {
      error_type = "inputerror"
      error = "Malformed cryptographic token format. Expected payload.signature."
    }
  
    var $payload_b64 {
      value = $token_parts[0]
    }
  
    var $provided_sig {
      value = $token_parts[1]
    }
  
    // Retrieve system migration secret
    var $migration_secret {
      value = ($env.MIGRATION_SECRET ?? "agn_season1_cloud_migration_secret_2026")
    }
  
    // Verify HMAC-SHA256 signature
    var $expected_sig {
      value = $payload_b64|hmac_sha256:$migration_secret
    }
  
    precondition ($provided_sig == $expected_sig) {
      error_type = "inputerror"
      error = "Cryptographic signature verification failed. Migration token is invalid or tampered."
    }
  
    // Decode verified payload JSON
    var $payload_data {
      value = $payload_b64|base64_decode|json_decode
    }
  
    // Extract authoritative verified email and legacy IDs from signed payload
    var $verified_email {
      value = $payload_data.email|to_lower|trim
    }
  
    precondition ($verified_email != null && $verified_email != "") {
      error_type = "inputerror"
      error = "Signed token payload does not contain a verified email."
    }
  
    var $legacy_id {
      value = ($payload_data.supabase_id ?? $payload_data.legacy_user_id)
    }
  
    var $display_name {
      value = ($payload_data.name ?? ($payload_data.display_name ?? "Migrated Player"))
    }
  
    var $handle {
      value = ($payload_data.handle ?? ($payload_data.username ?? null))
    }
  
    // Check if user already exists with verified email
    db.query user {
      where = $db.user.email == $verified_email
      return = {type: "single"}
    } as $user_record
  
    conditional {
      if ($user_record == null) {
        // Create new user account for migrated user
        db.add user {
          data = {
            created_at: "now"
            name      : $display_name
            email     : $verified_email
            role      : "player"
          }
        } as $user_record
      
        // Provision digital wallet
        db.add wallet {
          data = {
            user_id       : $user_record.id
            balance       : 0
            locked_balance: 0
            currency      : "USD"
          }
        } as $wallet
      }
    }
  
    // Link or update profile with authoritative migration status
    db.query profile {
      where = $db.profile.user_id == $user_record.id
      return = {type: "single"}
    } as $user_profile
  
    var $final_handle {
      value = ($handle ?? ("player_" ~ $user_record.id))
    }
  
    conditional {
      if ($user_profile == null) {
        db.add profile {
          data = {
            user_id         : $user_record.id
            handle          : $final_handle
            display_name    : $display_name
            pathway         : "competitor"
            age_band        : "unknown"
            theme_id        : "skin-gold"
            migration_status: "migrated"
          }
        } as $user_profile
      }
    
      else {
        db.edit profile {
          field_name = "id"
          field_value = $user_profile.id
          data = {migration_status: "migrated"}
        } as $user_profile
      }
    }
  
    // Generate authenticated session token
    security.create_auth_token {
      table = "user"
      extras = {}
      expiration = 86400
      id = $user_record.id
    } as $authToken
  }

  response = {
    authToken       : $authToken
    token           : $authToken
    auth_token      : $authToken
    migration_status: "migrated"
    legacy_user_id  : $legacy_id
    user            : ```
      {
        id: $user_record.id,
        name: $user_record.name,
        email: $user_record.email
      }
      ```
    profile         : $user_profile
  }
}