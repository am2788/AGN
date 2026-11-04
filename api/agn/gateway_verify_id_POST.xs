// Step 2: ID Verification Security Check requiring front and back scan of government-issued ID
query gateway_verify_id verb=POST {
  api_group = "AGN"
  auth = "user"

  input {
    // Gateway wager order identifier
    int order_id {
      table = "gateway_wager_order"
    }
  
    // Front scan image URL or file token of government-issued ID
    text id_front_image filters=trim
  
    // Back scan image URL or file token of government-issued ID
    text id_back_image filters=trim
  
    // Verification engine result of the scan
    bool scan_successful
  
    // Reason message if verification failed
    text? failure_reason filters=trim
  }

  stack {
    // Mandate both front and back scan of the government-issued ID
    precondition ((($input.id_front_image|strlen) > 0) && (($input.id_back_image|strlen) > 0)) {
      error_type = "inputerror"
      error = "Both front and back scans of your government-issued ID are required for 18+ verification."
    }
  
    // Retrieve the Gateway wager order
    db.get gateway_wager_order {
      field_name = "id"
      field_value = $input.order_id
    } as $order
  
    precondition ($order != null && $order.user_id == $auth.id) {
      error_type = "notfound"
      error = "Gateway order not found or unauthorized."
    }
  
    conditional {
      if (!$input.scan_successful) {
        // Transition to Amber Warning state
        db.edit gateway_wager_order {
          field_name = "id"
          field_value = $order.id
          data = {
            id_front_image       : $input.id_front_image
            id_back_image        : $input.id_back_image
            security_check_status: "amber"
          }
        } as $updated_order
      
        db.edit user {
          field_name = "id"
          field_value = $auth.id
          data = {
            id_front_image      : $input.id_front_image
            id_back_image       : $input.id_back_image
            security_check_state: "amber"
            kyc_status          : "pending"
          }
        } as $updated_user
      
        var $response_payload {
          value = {
            order        : $updated_order
            state        : "amber"
            color_state  : "amber"
            message      : "ID verification not accepted. Please check ID position, glare, and lighting on both front and back scans, then retry."
            retry_allowed: true
            next_step    : "retry_scan"
          }
        }
      }
    
      else {
        // Transition to Green Success state
        db.edit gateway_wager_order {
          field_name = "id"
          field_value = $order.id
          data = {
            id_front_image       : $input.id_front_image
            id_back_image        : $input.id_back_image
            security_check_status: "green"
          }
        } as $updated_order
      
        db.edit user {
          field_name = "id"
          field_value = $auth.id
          data = {
            id_front_image      : $input.id_front_image
            id_back_image       : $input.id_back_image
            security_check_state: "green"
            kyc_status          : "approved"
          }
        } as $updated_user
      
        var $response_payload {
          value = {
            order      : $updated_order
            state      : "green"
            color_state: "green"
            message    : "Front and back ID verified. Security check passed."
            next_step  : "checkout_tunnel"
            ui_page    : "Pages 92-95 Checkout Tunnel"
          }
        }
      }
    }
  }

  response = $response_payload
}