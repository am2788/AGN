// Administrative dedicated edge hardware and connection telemetry status monitor
query "admin/hardware/status" verb=GET {
  api_group = "AGN"
  auth = "user"

  input {
  }

  stack {
    // Strictly require admin role
    precondition ($auth.role == "admin") {
      error_type = "accessdenied"
      error = "Administrative access required."
    }
  
    // Fetch registered edge hardware nodes
    db.query hardware_nodes {
      sort = {region: "asc"}
      return = {type: "list"}
    } as $nodes
  
    // Fetch recent Shield check-ins
    db.query shield_checkins {
      sort = {created_at: "desc"}
      return = {type: "list", paging: {page: 1, per_page: 25}}
    } as $recent_checkins
  
    // Fetch recent connection alerts
    db.query connection_alerts {
      sort = {created_at: "desc"}
      return = {type: "list", paging: {page: 1, per_page: 25}}
    } as $alerts
  }

  response = {
    nodes          : $nodes
    recent_checkins: $recent_checkins
    alerts         : $alerts
  }
}