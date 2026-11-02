// Hardware and network telemetry logs analyzed by Gemini AI Referee
table referee_telemetry {
  auth = false

  schema {
    int id
    timestamp created_at?=now
  
    // Binds the telemetry check directly to an active match lobby
    int match_id {
      table = "match_lobby"
    }
  
    // Specific player being scanned
    int player_id {
      table = "user"
    }
  
    // Hardware handshake signature (e.g. Ethernet, Wi-Fi)
    text connection_adapter filters=trim
  
    // Real-time network consistency score
    decimal packet_jitter_ms
  
    // Latency reading to nearest regional server node
    decimal ping_latency_ms
  
    // Gemini automated referee verdict
    enum telemetry_verdict {
      values = ["pass_wired", "fail_wireless_booted", "fail_timeout_booted"]
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "match_id"}]}
    {type: "btree", field: [{name: "player_id"}]}
    {type: "btree", field: [{name: "telemetry_verdict"}]}
  ]
}