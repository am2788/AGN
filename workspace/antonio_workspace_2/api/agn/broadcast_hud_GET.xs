// Broadcast HUD telemetry for Red Spectator HUD and Blue Operator/Commentator Dashboard
query broadcast_hud verb=GET {
  api_group = "AGN"

  input {
    // Optional specific match identifier
    int? match_id
  }

  stack {
    // Retrieve active broadcast session
    db.query broadcast_session {
      where = $db.broadcast_session.match_id ==? $input.match_id && $db.broadcast_session.status != "rerun"
      sort = {created_at: "desc"}
      return = {type: "single"}
    } as $session
  
    // If no active session, fetch most recent rerun
    conditional {
      if ($session == null) {
        db.query broadcast_session {
          sort = {created_at: "desc"}
          return = {type: "single"}
        } as $fallback_session
      
        var.update $session {
          value = $fallback_session
        }
      }
    }
  }

  response = {
    session  : $session
    hud_views: ```
      {
        red_interface: {
          role: "spectator",
          score_a: $session.score_a,
          score_b: $session.score_b,
          ticker: $session.ticker_announcement,
          stream_url: $session.stream_url
        },
        blue_interface: {
          role: "commentator_operator",
          score_a: $session.score_a,
          score_b: $session.score_b,
          notes: $session.commentator_notes,
          status: $session.status
        }
      }
      ```
  }
}