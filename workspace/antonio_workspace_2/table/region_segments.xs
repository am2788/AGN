// Regional time slots and segment schedules
table region_segments {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Global competitive region
    enum region {
      values = ["asia", "europe", "americas"]
    }
  
    // Daily start time UTC (HH:MM)
    text start_utc filters=trim
  
    // Daily end time UTC (HH:MM)
    text end_utc filters=trim
  
    // Whether segment extends into next UTC day
    bool next_day?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "region"}]}
  ]
}