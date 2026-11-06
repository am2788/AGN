// Admin safety moderation enforcement action
query "admin/safety/action" verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Abuse report ID
    int report_id {
      table = "abuse_reports"
    }
  
    // Moderation action to execute: resolve, dismiss, or ban
    text action filters=trim
  
    // Reason or resolution notes
    text? reason? filters=trim
  }

  stack {
    // Strictly require admin role
    precondition ($auth.role == "admin") {
      error_type = "accessdenied"
      error = "Administrative access required."
    }
  
    // Retrieve target abuse report
    db.get abuse_reports {
      field_name = "id"
      field_value = $input.report_id
    } as $report
  
    precondition ($report != null) {
      error_type = "notfound"
      error = "Report not found."
    }
  
    conditional {
      if ($input.action == "ban") {
        // Record active account ban
        db.add bans {
          data = {
            user_id           : $report.reported_user_id
            reason            : ($input.reason ?? "Violation reported in abuse incident")
            banned_by_admin_id: $auth.id
            active            : true
          }
        } as $new_ban
      
        // Update report status
        db.edit abuse_reports {
          field_name = "id"
          field_value = $report.id
          data = {status: "resolved"}
        } as $updated_report
      }
    
      elseif ($input.action == "dismiss") {
        db.edit abuse_reports {
          field_name = "id"
          field_value = $report.id
          data = {status: "dismissed"}
        } as $updated_report
      }
    
      else {
        db.edit abuse_reports {
          field_name = "id"
          field_value = $report.id
          data = {status: "resolved"}
        } as $updated_report
      }
    }
  }

  response = {
    success: true
    action : $input.action
    report : $updated_report
  }
}