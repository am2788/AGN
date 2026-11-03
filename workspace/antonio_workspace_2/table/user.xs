// Core user table with authentication and pathway profiles
table user {
  auth = true

  schema {
    int id
    timestamp created_at?=now {
      visibility = "private"
    }
  
    text name filters=trim
    email? email filters=trim|lower
    password? password filters=min:8|minAlpha:1|minDigit:1 {
      visibility = "internal"
    }
  
    // Pathway chosen by user: competitor, wagering, or spectator
    enum pathway?=spectator {
      values = ["competitor", "wagering", "spectator"]
    }
  
    // Hardware network fingerprint for The Shield verification
    text? hardware_fingerprint
  
    // Whether player has verified wired ethernet connection
    bool is_wired_verified?
  
    // Linked social profile for YouTube
    text? social_youtube
  
    // Linked social profile for Twitch
    text? social_twitch
  
    // Linked social profile for Spotify
    text? social_spotify
  
    // Government ID verification status for 18+ wagering pathway
    enum kyc_status?=none {
      values = ["none", "pending", "approved", "rejected"]
    }
  
    // Permanent ultra-rare First Strike motion calling card badge
    bool has_first_strike?
  
    // Active calling card cosmetic identifier
    text calling_card?=standard
  
    // Total stream watch time in seconds for spectator rewards
    int stream_watch_seconds?
  
    // Role within the AGN, ASN, and Topgamer ecosystem
    enum role?=player {
      values = [
        "player"
        "captain"
        "spectator"
        "commentator"
        "operator"
        "broadcast_operator"
        "moderator"
        "admin"
        "partner"
      ]
    
    }
  
    // Security check ID verification UI state
    enum security_check_state?=neutral {
      values = ["neutral", "amber", "green"]
    }
  
    // Mobile phone number for automated Twilio match alerts and 2FA
    text? phone_number filters=trim
  
    // Single sign-on authentication provider (email, Google, Apple)
    enum oauth_provider?=email {
      values = ["email", "google", "apple"]
    }
  
    // External OAuth provider subject/account ID
    text? oauth_id filters=trim
  
    // Linked Meta account handle (Facebook/Instagram)
    text? meta_handle filters=trim
  
    // Government-issued ID front scan image URL or file token
    text? id_front_image filters=trim
  
    // Government-issued ID back scan image URL or file token
    text? id_back_image filters=trim
  
    // Primary personal streaming channel URL (Twitch, YouTube, Kick)
    text? primary_stream_url filters=trim
  
    // Unique non-shareable stream access token generated upon signup
    text? exclusive_stream_token filters=trim
  
    // Private participant streaming key for tournament matches
    text? exclusive_stream_key filters=trim
  
    // Optional device ID from client
    text? device_id filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
    {type: "btree|unique", field: [{name: "email", op: "asc"}]}
    {type: "btree", field: [{name: "pathway", op: "asc"}]}
    {type: "btree", field: [{name: "role", op: "asc"}]}
    {type: "btree", field: [{name: "phone_number", op: "asc"}]}
    {
      type : "btree|unique"
      field: [{name: "exclusive_stream_token"}]
    }
  ]
}