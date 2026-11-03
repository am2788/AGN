// Provision or reset Alpha test user (id 19) and linked wallet and player profiles
query "seed/alpha_test_user" verb=POST {
  api_group = "AGN"

  input {
  }

  stack {
    // Find any existing user with ID 19 or the target email
    db.query user {
      where = $db.user.id == 19 || $db.user.email == "agn.test.alpha@outlook.com"
      return = {type: "list"}
      output = ["id"]
    } as $existing_users
  
    // Remove existing user records and their linked records
    foreach ($existing_users) {
      each as $u {
        // Delete linked wallet for existing user
        db.bulk.delete wallet {
          where = $db.wallet.user_id == $u.id
        } as $del_wallet_user
      
        // Delete linked player profile for existing user
        db.bulk.delete player {
          where = $db.player.user_id == $u.id
        } as $del_player_user
      
        // Delete the user record
        db.del user {
          field_name = "id"
          field_value = $u.id
        }
      }
    }
  
    // Clean up any remaining wallet records for user ID 19
    db.bulk.delete wallet {
      where = $db.wallet.user_id == 19
    } as $del_wallet_19
  
    // Clean up any remaining player profiles for user ID 19 or AlphaTester username
    db.bulk.delete player {
      where = $db.player.user_id == 19 || $db.player.username == "AlphaTester"
    } as $del_player_19
  
    // Insert the Alpha test user with ID 19 and secure password
    db.add user {
      data = {
        id          : 19
        name        : "Alpha Tester"
        email       : "agn.test.alpha@outlook.com"
        password    : "AGNTestPass2026!"
        pathway     : "competitor"
        role        : "player"
        calling_card: "standard"
      }
    } as $user
  
    // Auto-provision a corresponding digital wallet record linked to user_id 19
    db.add wallet {
      data = {
        user_id       : 19
        balance       : 0
        locked_balance: 0
        currency      : "USD"
      }
    } as $wallet
  
    // Auto-provision a standard tournament player profile record linked to user_id 19
    db.add player {
      data = {
        user_id        : 19
        username       : "AlphaTester"
        level          : 1
        xp             : 0
        xp_max         : 1000
        rank_label     : "ROOKIE"
        rank_percentile: 100
        equipped_tier  : "standard"
      }
    } as $player
  }

  response = {
    message: "Alpha test user and matching wallet profiles successfully provisioned for stress testing."
    user   : ```
      {
        id: $user.id,
        name: $user.name,
        email: $user.email
      }
      ```
    wallet : $wallet
    player : $player
  }
}