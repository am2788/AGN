// List all direct message conversation threads for the authenticated user
query "dm/threads" verb=GET {
  api_group = "AGN"
  auth = "user"

  input {
  }

  stack {
    // Ensure AGN welcome thread exists
    function.run ensure_agn_onboarding {
      input = {user_id: $auth.id}
    } as $onboarding
  
    // Fetch all thread memberships for user
    db.query dm_thread_member {
      join = {
        dm_thread: {
          table: "dm_thread"
          where: $db.dm_thread_member.thread_id == $db.dm_thread.id
        }
      }
    
      where = $db.dm_thread_member.user_id == $auth.id
      return = {type: "list"}
    } as $memberships
  }

  response = {threads: $memberships}
}