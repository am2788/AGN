// Seed Season 1 themes, tournaments, and regional segments idempotently
// Idempotently populate app_themes, tournaments, and region_segments with Season 1 initial configuration
function seed_season1_data {
  input {
  }

  stack {
    // Seed core themes idempotently: simple-gold (default), skin-gold, skin-redneon, skin-blueneon, skin-cyber
    var $core_themes {
      value = [
        {
          theme_id  : "simple-gold"
          kind      : "simple"
          label     : "Simple Gold"
          enabled   : true
          is_default: true
          sort      : 1
        }
        {
          theme_id  : "skin-gold"
          kind      : "skin"
          label     : "Skin Gold"
          enabled   : true
          is_default: false
          sort      : 2
        }
        {
          theme_id  : "skin-redneon"
          kind      : "skin"
          label     : "Skin Red Neon"
          enabled   : true
          is_default: false
          sort      : 3
        }
        {
          theme_id  : "skin-blueneon"
          kind      : "skin"
          label     : "Skin Blue Neon"
          enabled   : true
          is_default: false
          sort      : 4
        }
        {
          theme_id  : "skin-cyber"
          kind      : "skin"
          label     : "Skin Cyber"
          enabled   : true
          is_default: false
          sort      : 5
        }
      ]
    }
  
    foreach ($core_themes) {
      each as $theme_item {
        db.query app_themes {
          where = $db.app_themes.theme_id == $theme_item.theme_id
          return = {type: "single"}
        } as $found_theme
      
        conditional {
          if ($found_theme == null) {
            db.add app_themes {
              data = {
                theme_id  : $theme_item.theme_id
                kind      : $theme_item.kind
                label     : $theme_item.label
                enabled   : $theme_item.enabled
                is_default: $theme_item.is_default
                sort      : $theme_item.sort
              }
            } as $created_theme
          }
        }
      }
    }
  
    // Check if region segments are seeded
    db.query region_segments {
      return = {type: "count"}
    } as $region_count
  
    conditional {
      if ($region_count == 0) {
        db.add region_segments {
          data = {
            region   : "asia"
            start_utc: "12:00"
            end_utc  : "15:00"
            next_day : false
          }
        } as $r1
      
        db.add region_segments {
          data = {
            region   : "europe"
            start_utc: "20:00"
            end_utc  : "23:00"
            next_day : false
          }
        } as $r2
      
        db.add region_segments {
          data = {
            region   : "americas"
            start_utc: "02:00"
            end_utc  : "05:00"
            next_day : true
          }
        } as $r3
      }
    }
  
    // Seed or update the 6 Season 1 launch title tournaments
    var $launch_tournaments {
      value = [
        {
          title            : "Tekken 8"
          format           : "solo_1v1"
          lane_order       : 1
          capacity         : 6144
          roster_size      : 1
          start_date       : "2026-11-23"
          prize_base       : 100000
          prize_per_player : 100000
          plan_full_price  : 375
          plan_weekly_price: 50
          plan_weeks       : 8
          status           : "open"
        }
        {
          title            : "Street Fighter 6"
          format           : "solo_1v1"
          lane_order       : 2
          capacity         : 6144
          roster_size      : 1
          start_date       : "2026-11-23"
          prize_base       : 100000
          prize_per_player : 100000
          plan_full_price  : 375
          plan_weekly_price: 50
          plan_weeks       : 8
          status           : "open"
        }
        {
          title            : "EA Sports FC 27"
          format           : "solo_1v1"
          lane_order       : 3
          capacity         : 6144
          roster_size      : 1
          start_date       : "2026-11-23"
          prize_base       : 100000
          prize_per_player : 100000
          plan_full_price  : 375
          plan_weekly_price: 50
          plan_weeks       : 8
          status           : "open"
        }
        {
          title            : "Counter-Strike 2"
          format           : "team_5v5_plus1"
          lane_order       : 4
          capacity         : 6144
          roster_size      : 6
          start_date       : "2026-11-23"
          prize_base       : 600000
          prize_per_player : 100000
          plan_full_price  : 1875
          plan_weekly_price: 275
          plan_weeks       : 8
          status           : "open"
        }
        {
          title            : "Valorant"
          format           : "team_5v5_plus1"
          lane_order       : 5
          capacity         : 6144
          roster_size      : 6
          start_date       : "2026-11-23"
          prize_base       : 600000
          prize_per_player : 100000
          plan_full_price  : 1875
          plan_weekly_price: 275
          plan_weeks       : 8
          status           : "open"
        }
        {
          title            : "Rocket League"
          format           : "team_3v3"
          lane_order       : 6
          capacity         : 6144
          roster_size      : 3
          start_date       : "2026-11-23"
          prize_base       : 85000
          prize_per_player : 28333
          plan_full_price  : 850
          plan_weekly_price: 125
          plan_weeks       : 8
          status           : "open"
        }
      ]
    }
  
    foreach ($launch_tournaments) {
      each as $trn_spec {
        db.query tournaments {
          where = $db.tournaments.lane_order == $trn_spec.lane_order
          return = {type: "single"}
        } as $existing_trn
      
        conditional {
          if ($existing_trn == null) {
            db.add tournaments {
              data = {
                title            : $trn_spec.title
                format           : $trn_spec.format
                lane_order       : $trn_spec.lane_order
                capacity         : $trn_spec.capacity
                roster_size      : $trn_spec.roster_size
                start_date       : $trn_spec.start_date
                prize_base       : $trn_spec.prize_base
                prize_per_player : $trn_spec.prize_per_player
                plan_full_price  : $trn_spec.plan_full_price
                plan_weekly_price: $trn_spec.plan_weekly_price
                plan_weeks       : $trn_spec.plan_weeks
                status           : $trn_spec.status
              }
            } as $new_trn
          }
        
          else {
            db.edit tournaments {
              field_name = "id"
              field_value = $existing_trn.id
              data = {
                title            : $trn_spec.title
                format           : $trn_spec.format
                capacity         : $trn_spec.capacity
                roster_size      : $trn_spec.roster_size
                start_date       : $trn_spec.start_date
                prize_base       : $trn_spec.prize_base
                prize_per_player : $trn_spec.prize_per_player
                plan_full_price  : $trn_spec.plan_full_price
                plan_weekly_price: $trn_spec.plan_weekly_price
                plan_weeks       : $trn_spec.plan_weeks
                status           : $trn_spec.status
              }
            } as $updated_trn
          }
        }
      }
    }
  
    // Check if skin assets are seeded
    db.query skin_assets {
      return = {type: "count"}
    } as $skin_assets_count
  
    conditional {
      if ($skin_assets_count == 0) {
        // Skin Gold responsive assets
        db.add skin_assets {
          data = {
            theme_id: "skin-gold"
            device  : "desk"
            screen  : "dashboard"
            layer   : "shell"
            url     : "https://assets.agn.gg/skins/gold/desk_shell_1080p.png"
            width   : 1920
            height  : 1080
            is_4k   : false
          }
        } as $sa1
      
        db.add skin_assets {
          data = {
            theme_id: "skin-gold"
            device  : "desk"
            screen  : "dashboard"
            layer   : "shell"
            url     : "https://assets.agn.gg/skins/gold/desk_shell_4k.png"
            width   : 3840
            height  : 2160
            is_4k   : true
          }
        } as $sa2
      
        db.add skin_assets {
          data = {
            theme_id: "skin-gold"
            device  : "desk"
            screen  : "dashboard"
            layer   : "full"
            url     : "https://assets.agn.gg/skins/gold/desk_full_1080p.png"
            width   : 1920
            height  : 1080
            is_4k   : false
          }
        } as $sa3
      
        db.add skin_assets {
          data = {
            theme_id: "skin-gold"
            device  : "desk"
            screen  : "dashboard"
            layer   : "full"
            url     : "https://assets.agn.gg/skins/gold/desk_full_4k.png"
            width   : 3840
            height  : 2160
            is_4k   : true
          }
        } as $sa4
      
        db.add skin_assets {
          data = {
            theme_id: "skin-gold"
            device  : "mob"
            screen  : "dashboard"
            layer   : "shell"
            url     : "https://assets.agn.gg/skins/gold/mob_shell.png"
            width   : 1080
            height  : 2340
            is_4k   : false
          }
        } as $sa5
      
        db.add skin_assets {
          data = {
            theme_id: "skin-gold"
            device  : "mob"
            screen  : "dashboard"
            layer   : "full"
            url     : "https://assets.agn.gg/skins/gold/mob_full.png"
            width   : 1080
            height  : 2340
            is_4k   : false
          }
        } as $sa6
      
        // Skin Red Neon responsive assets
        db.add skin_assets {
          data = {
            theme_id: "skin-redneon"
            device  : "desk"
            screen  : "dashboard"
            layer   : "shell"
            url     : "https://assets.agn.gg/skins/redneon/desk_shell_1080p.png"
            width   : 1920
            height  : 1080
            is_4k   : false
          }
        } as $sa7
      
        db.add skin_assets {
          data = {
            theme_id: "skin-redneon"
            device  : "desk"
            screen  : "dashboard"
            layer   : "full"
            url     : "https://assets.agn.gg/skins/redneon/desk_full_1080p.png"
            width   : 1920
            height  : 1080
            is_4k   : false
          }
        } as $sa8
      
        db.add skin_assets {
          data = {
            theme_id: "skin-redneon"
            device  : "mob"
            screen  : "dashboard"
            layer   : "shell"
            url     : "https://assets.agn.gg/skins/redneon/mob_shell.png"
            width   : 1080
            height  : 2340
            is_4k   : false
          }
        } as $sa9
      
        // Skin Blue Neon responsive assets
        db.add skin_assets {
          data = {
            theme_id: "skin-blueneon"
            device  : "desk"
            screen  : "dashboard"
            layer   : "shell"
            url     : "https://assets.agn.gg/skins/blueneon/desk_shell_1080p.png"
            width   : 1920
            height  : 1080
            is_4k   : false
          }
        } as $sa10
      
        db.add skin_assets {
          data = {
            theme_id: "skin-blueneon"
            device  : "desk"
            screen  : "dashboard"
            layer   : "full"
            url     : "https://assets.agn.gg/skins/blueneon/desk_full_1080p.png"
            width   : 1920
            height  : 1080
            is_4k   : false
          }
        } as $sa11
      
        db.add skin_assets {
          data = {
            theme_id: "skin-blueneon"
            device  : "mob"
            screen  : "dashboard"
            layer   : "shell"
            url     : "https://assets.agn.gg/skins/blueneon/mob_shell.png"
            width   : 1080
            height  : 2340
            is_4k   : false
          }
        } as $sa12
      
        // Skin Cyber responsive assets
        db.add skin_assets {
          data = {
            theme_id: "skin-cyber"
            device  : "desk"
            screen  : "dashboard"
            layer   : "shell"
            url     : "https://assets.agn.gg/skins/cyber/desk_shell_1080p.png"
            width   : 1920
            height  : 1080
            is_4k   : false
          }
        } as $sa13
      
        db.add skin_assets {
          data = {
            theme_id: "skin-cyber"
            device  : "desk"
            screen  : "dashboard"
            layer   : "full"
            url     : "https://assets.agn.gg/skins/cyber/desk_full_1080p.png"
            width   : 1920
            height  : 1080
            is_4k   : false
          }
        } as $sa14
      
        db.add skin_assets {
          data = {
            theme_id: "skin-cyber"
            device  : "mob"
            screen  : "dashboard"
            layer   : "shell"
            url     : "https://assets.agn.gg/skins/cyber/mob_shell.png"
            width   : 1080
            height  : 2340
            is_4k   : false
          }
        } as $sa15
      
        // Simple Gold default responsive assets
        db.add skin_assets {
          data = {
            theme_id: "simple-gold"
            device  : "desk"
            screen  : "dashboard"
            layer   : "shell"
            url     : "https://assets.agn.gg/skins/simple-gold/desk_shell.png"
            width   : 1920
            height  : 1080
            is_4k   : false
          }
        } as $sa16
      
        db.add skin_assets {
          data = {
            theme_id: "simple-gold"
            device  : "mob"
            screen  : "dashboard"
            layer   : "shell"
            url     : "https://assets.agn.gg/skins/simple-gold/mob_shell.png"
            width   : 1080
            height  : 2340
            is_4k   : false
          }
        } as $sa17
      
        // Simple Alt responsive assets
        db.add skin_assets {
          data = {
            theme_id: "simple-alt"
            device  : "desk"
            screen  : "dashboard"
            layer   : "shell"
            url     : "https://assets.agn.gg/skins/simple-alt/desk_shell.png"
            width   : 1920
            height  : 1080
            is_4k   : false
          }
        } as $sa18
      
        db.add skin_assets {
          data = {
            theme_id: "simple-alt"
            device  : "mob"
            screen  : "dashboard"
            layer   : "shell"
            url     : "https://assets.agn.gg/skins/simple-alt/mob_shell.png"
            width   : 1080
            height  : 2340
            is_4k   : false
          }
        } as $sa19
      }
    }
  
    // Check if calling cards are seeded
    db.query calling_card {
      return = {type: "count"}
    } as $cards_count
  
    conditional {
      if ($cards_count == 0) {
        db.add calling_card {
          data = {
            key       : "standard"
            name      : "Standard Arena"
            tier      : "standard"
            image_url : "https://assets.agn.gg/cards/standard.png"
            video_url : null
            is_premium: false
            is_public : true
          }
        } as $c1
      
        db.add calling_card {
          data = {
            key       : "first_strike"
            name      : "First Strike Motion"
            tier      : "premium"
            image_url : null
            video_url : "https://assets.agn.gg/cards/first_strike.mp4"
            is_premium: true
            is_public : true
          }
        } as $c2
      
        db.add calling_card {
          data = {
            key       : "premium_wagerer"
            name      : "High Roller Gold"
            tier      : "premium"
            image_url : null
            video_url : "https://assets.agn.gg/cards/high_roller.mp4"
            is_premium: true
            is_public : true
          }
        } as $c3
      }
    }
  
    // Seed Season 1 Grand Progressive Jackpot Vault if none active
    db.query jackpot_vault {
      where = $db.jackpot_vault.status == "active"
      return = {type: "single"}
    } as $active_vault
  
    conditional {
      if ($active_vault == null) {
        db.add jackpot_vault {
          data = {
            name                : "Season 1 Grand Progressive Vault"
            current_vault_amount: 100000
            funding_cut_pct     : 4
            season              : 1
            status              : "active"
            running_total       : 100000
          }
        } as $seeded_vault
      }
    }
  
    // Seed Season 2 democratic title ballot candidate options if not yet seeded
    db.query ballot_options {
      where = $db.ballot_options.season == 2
      return = {type: "count"}
    } as $season2_ballot_count
  
    conditional {
      if ($season2_ballot_count == 0) {
        db.add ballot_options {
          data = {
            season    : 2
            title     : "Call of Duty: Warzone"
            vote_count: 0
          }
        } as $b1
      
        db.add ballot_options {
          data = {season: 2, title: "Apex Legends", vote_count: 0}
        } as $b2
      
        db.add ballot_options {
          data = {season: 2, title: "Halo Infinite", vote_count: 0}
        } as $b3
      
        db.add ballot_options {
          data = {season: 2, title: "Overwatch 2", vote_count: 0}
        } as $b4
      }
    }
  }

  response = {
    success: true
    message: "Season 1 seed data initialized successfully"
  }
}