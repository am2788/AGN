// Unfollow a player profile
query unfollow verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Target user to unfollow
    int following_id {
      table = "user"
    }
  }

  stack {
    // Delete follow relationship
    db.bulk.delete follow {
      where = $db.follow.follower_id == $auth.id && $db.follow.following_id == $input.following_id
    } as $deleted_count
  }

  response = {unfollowed: true, count: $deleted_count}
}