// Authoritative user preferences, pathway, and social identity
table profile {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Reference to user account
    int user_id {
      table = "user"
    }
  
    // Unique user handle/slug
    text handle filters=trim|lower
  
    // Public display name
    text display_name filters=trim
  
    // Pathway chosen by user: competitor, wagerer, spectator
    enum pathway?=spectator {
      values = ["competitor", "wagerer", "spectator"]
    }
  
    // Age verification band (treat missing/unverified as unknown, never 18+)
    enum age_band?=unknown {
      values = ["unknown", "13-17", "18+"]
    }
  
    // Authoritative single source of truth for user theme
    text? theme_id filters=trim
  
    // Equipped calling card tier
    text? calling_card_tier filters=trim
  
    // External social channel: YouTube
    text? youtube_url filters=trim
  
    // External social channel: Spotify
    text? spotify_url filters=trim
  
    // External social channel: Twitch
    text? twitch_url filters=trim
  
    // External social channel: SoundCloud
    text? soundcloud_url filters=trim
  
    // Migration status for legacy Lovable Cloud/Supabase accounts
    text? migration_status filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "user_id"}]}
    {type: "btree|unique", field: [{name: "handle"}]}
    {type: "btree", field: [{name: "age_band"}]}
    {type: "btree", field: [{name: "pathway"}]}
  ]
}