// Signup and retrieve an authentication token
query "auth/signup" verb=POST {
  api_group = "Authentication"

  input {
    text name?
    email email? filters=trim|lower
    text password?
  
    // Mobile phone number (optional)
    text? phone_number filters=trim
  
    // Optional device ID from client
    text? device_id filters=trim
  
    // Client hardware identifier for The Shield
    text? hardware_fingerprint filters=trim
  
    // Front scan image URL of government-issued ID
    text? id_front_image filters=trim
  
    // Back scan image URL of government-issued ID
    text? id_back_image filters=trim
  }

  stack {
    db.get user {
      field_name = "email"
      field_value = $input.email
    } as $user
  
    precondition ($user == null) {
      error_type = "accessdenied"
      error = "This account is already in use."
    }
  
    db.add user {
      enforce_hidden_fields = false
      data = {
        created_at          : "now"
        name                : $input.name
        email               : $input.email
        password            : $input.password
        phone_number        : $input.phone_number
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
  
    security.create_auth_token {
      table = "user"
      extras = {}
      expiration = 86400
      id = $user.id
    } as $authToken
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
  }
}