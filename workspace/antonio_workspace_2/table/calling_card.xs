// Calling card cosmetic catalog
table calling_card {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Unique system key identifier
    text key filters=trim|lower
  
    // Display name of calling card
    text name filters=trim
  
    // Card tier category: standard or premium
    enum tier?=standard {
      values = ["standard", "premium"]
    }
  
    // Static artwork image URL for standard cards
    text? image_url filters=trim
  
    // Short muted video mp4 loop URL for premium motion cards
    text? video_url filters=trim
  
    // Whether this card is a premium motion card
    bool is_premium?
  
    // Whether card is publicly visible in unverified catalogs
    bool is_public?=true
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "key"}]}
    {type: "btree", field: [{name: "tier"}]}
    {type: "btree", field: [{name: "is_public"}]}
  ]
}