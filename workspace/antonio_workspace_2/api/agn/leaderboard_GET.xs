// Global and regional competitive leaderboard rankings
query leaderboard verb=GET {
  api_group = "AGN"

  input {
    // Target competitive season (defaults to current)
    text? season filters=trim
  
    // Game mode filter (e.g. all, solo, teams)
    text? mode filters=trim
  
    // Region code filter (e.g. GLOBAL, NA, EU)
    text? region filters=trim
  
    // Page number for paginated results (1-indexed)
    int? page
  
    // Number of records per page (default 25)
    int? per_page
  }

  stack {
    // Resolve page number with fallback to 1
    var $page {
      value = $input.page ?? 1
    }
  
    // Resolve per-page limit with fallback to 25
    var $per_page {
      value = $input.per_page ?? 25
    }
  
    // Query competitive player standings with clan join
    db.query player {
      join = {
        clan: {
          table: "clan"
          type : "left"
          where: $db.player.clan_id == $db.clan.id
        }
      }
    
      sort = {global_rank: "asc", xp: "desc"}
      eval = {clan_name: $db.clan.name, clan_tag: $db.clan.tag}
      return = {
        type  : "list"
        paging: {page: $page, per_page: $per_page, totals: true}
      }
    } as $player_results
  
    // Format leaderboard rows with calling card and calculated stats
    var $leaderboard_rows {
      value = []
    }
  
    // Iterate through returned players to build clean row items
    foreach ($player_results.items) {
      each as $p {
        // Calculate display rank fallback if global_rank is unset
        var $calculated_rank {
          value = $p.global_rank ?? (($page - 1) * $per_page + $loop.index + 1)
        }
      
        // Calculate win rate percentage
        var $win_rate {
          value = 0
        }
      
        conditional {
          if ($p.matches_played > 0) {
            var.update $win_rate {
              value = (($p.match_wins / $p.matches_played) * 100)|round:1
            }
          }
        }
      
        // Build calling card summary object
        var $calling_card {
          value = {equipped_tier: $p.equipped_tier ?? "standard"}
        }
      
        // Build row data
        var $row {
          value = {
            rank          : $calculated_rank
            player_id     : $p.id
            user_id       : $p.user_id
            username      : $p.username
            rank_label    : $p.rank_label
            level         : $p.level
            xp            : $p.xp
            xp_max        : $p.xp_max
            clan_name     : $p.clan_name
            clan_tag      : $p.clan_tag
            matches_played: $p.matches_played ?? 0
            match_wins    : $p.match_wins ?? 0
            win_rate      : $win_rate
            kd_ratio      : $p.kd_ratio ?? 0
            total_earnings: $p.total_earnings ?? 0
            is_online     : $p.is_online ?? false
            calling_card  : $calling_card
          }
        }
      
        // Push formatted row to list
        var.update $leaderboard_rows {
          value = $leaderboard_rows|push:$row
        }
      }
    }
  }

  response = {
    season        : $input.season ?? "current"
    mode          : $input.mode ?? "all"
    region        : $input.region ?? "GLOBAL"
    cur_page      : $player_results.cur_page
    next_page     : $player_results.next_page
    prev_page     : $player_results.prev_page
    page_total    : $player_results.page_total
    items_total   : $player_results.items_total
    items_received: $player_results.items_received
    items         : $leaderboard_rows
    leaderboard   : $leaderboard_rows
  }
}