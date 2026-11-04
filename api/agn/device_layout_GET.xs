// Device layout auto-correction and responsive HUD configurations for Desktop, Mobile, and Console
query device_layout verb=GET {
  api_group = "AGN"

  input {
    // Client device category: desktop, mobile, console
    text device_type?=desktop filters=trim|lower
  }

  stack {
    var $layout_config {
      value = {
        device                : "desktop"
        viewport_mode         : "multi_pane_command_center"
        grid_columns          : 3
        music_player_placement: "docked_sidebar_or_floating"
        fullscreen_supported  : true
        overscan_safe_zone    : false
        touch_optimized       : false
        controller_dpad_nav   : false
        hud_scale_factor      : 1
        overchat_placement    : "persistent_right_column"
      }
    }
  
    conditional {
      if ($input.device_type == "mobile") {
        var.update $layout_config {
          value = {
            device                : "mobile"
            viewport_mode         : "single_column_sheet_layout"
            grid_columns          : 1
            music_player_placement: "bottom_docked_mini_player_with_swipe_up_fullscreen"
            fullscreen_supported  : true
            overscan_safe_zone    : false
            touch_optimized       : true
            controller_dpad_nav   : false
            hud_scale_factor      : 0.85
            overchat_placement    : "sliding_bottom_or_side_drawer"
          }
        }
      }
    
      elseif ($input.device_type == "console") {
        var.update $layout_config {
          value = {
            device                : "console"
            viewport_mode         : "ten_foot_tv_interface"
            grid_columns          : 2
            music_player_placement: "top_bar_hud_with_fullscreen_theater_toggle"
            fullscreen_supported  : true
            overscan_safe_zone    : true
            touch_optimized       : false
            controller_dpad_nav   : true
            hud_scale_factor      : 1.25
            overchat_placement    : "docked_transparent_overlay"
          }
        }
      }
    }
  }

  response = {
    requested_device    : $input.device_type
    layout_configuration: $layout_config
  }
}