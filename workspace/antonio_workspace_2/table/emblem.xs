// Player emblem catalog across 4 tiers
table emblem {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Emblem subject identifier or name
    text subject filters=trim
  
    // Emblem tier category
    enum tier {
      values = ["legendary", "gold", "silver", "bronze"]
    }
  
    // Display name of emblem
    text name filters=trim
  
    // Artwork asset URL
    text? image_url filters=trim
  
    // Whether this emblem represents a competitive rank tier
    bool is_rank_emblem?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "subject"}]}
    {type: "btree", field: [{name: "tier"}]}
    {type: "btree", field: [{name: "is_rank_emblem"}]}
  ]
}