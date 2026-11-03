// Login and retrieve an authentication token
query "auth/login" verb=POST {
  api_group = "Authentication"

  input {
    // User email address
    text? email filters=trim|lower
  
    // User account password
    text? password
  }

  stack {
    // Look up user record by email
    db.get user {
      field_name = "email"
      field_value = $input.email
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
  
    // Generate authenticated session token
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