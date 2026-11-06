// 24/7 Overchat messages across AGN, ASN, and Topgamer.gg
table overchat_message {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Message sender user account
    int user_id {
      table = "user"
    }
  
    // Originating platform skin
    enum platform_origin?=agn {
      values = ["agn", "asn", "topgamer"]
    }
  
    // Active chat room or channel
    text channel?=global filters=trim
  
    // Message text body
    text message filters=trim
  
    // Pinned announcement flag
    bool is_pinned?
  
    // Moderation approval flag
    bool is_moderated?=true
  
    // Originating integrated stream or platform source
    enum origin?=agn {
      values = ["agn", "twitch", "youtube", "x", "meta", "discord"]
    }
  
    // External integrated streaming platform origin (legacy field)
    enum external_source?=agn {
      values = ["agn", "meta", "twitch", "youtube"]
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "channel"}]}
    {type: "btree", field: [{name: "origin"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}