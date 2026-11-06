// Disconnect external streaming or social platform connection
query "platform/disconnect" verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // External streaming provider to disconnect
    text provider filters=trim
  }

  stack {
    // Remove stored platform connection tokens
    db.bulk.delete platform_connection {
      where = $db.platform_connection.user_id == $auth.id && $db.platform_connection.provider == $input.provider
    } as $deleted_count
  }

  response = {
    success     : true
    provider    : $input.provider
    disconnected: true
  }
}