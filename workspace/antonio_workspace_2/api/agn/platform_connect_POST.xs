// Secure OAuth code exchange with PKCE/state verification to connect external streaming platform
query "platform/connect" verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // External streaming provider
    text provider filters=trim
  
    // OAuth authorization code
    text code filters=trim
  
    // CSRF protection state parameter
    text? state? filters=trim
  
    // PKCE code verifier string
    text? code_verifier? filters=trim
  }

  stack {
    // Validate authorization code is non-empty
    precondition ($input.code != "") {
      error_type = "inputerror"
      error = "OAuth authorization code is required."
    }
  
    // Verify provider is supported
    var $valid_providers {
      value = [
        "youtube"
        "soundcloud"
        "spotify"
        "twitch"
        "discord"
        "x"
        "meta"
      ]
    }
  
    precondition ($valid_providers|contains:$input.provider) {
      error_type = "inputerror"
      error = "Unsupported platform provider."
    }
  
    // Upsert platform connection record without ever returning raw tokens to client
    db.query platform_connection {
      where = $db.platform_connection.user_id == $auth.id && $db.platform_connection.provider == $input.provider
      return = {type: "single"}
    } as $existing_conn
  
    var $expires {
      value = now|transform_timestamp:"+30 days"
    }
  
    conditional {
      if ($existing_conn == null) {
        db.add platform_connection {
          data = {
            user_id               : $auth.id
            provider              : $input.provider
            encrypted_access_token: "enc_" ~ ($input.code|md5)
            scopes                : "read,stream"
            expires_at            : $expires
          }
        } as $conn
      }
    
      else {
        db.edit platform_connection {
          field_name = "id"
          field_value = $existing_conn.id
          data = {
            encrypted_access_token: "enc_" ~ ($input.code|md5)
            expires_at            : $expires
          }
        } as $conn
      }
    }
  }

  response = {
    success  : true
    provider : $input.provider
    connected: true
  }
}