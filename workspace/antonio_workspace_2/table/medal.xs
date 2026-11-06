// Medal reward catalog
table medal {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Medal display name
    text? name filters=trim
  
    // Description of medal requirements
    text? description filters=trim
  
    // Icon asset URL
    text? icon_url filters=trim
  
    // Threshold value required to earn medal
    int? threshold
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}