package com.dabbadelight.regionalmeals.model.DTO;

import java.time.LocalDateTime;
import java.util.List;

import com.dabbadelight.regionalmeals.model.enums.OrderStatus;
import com.dabbadelight.regionalmeals.model.enums.PaymentMode;
import com.dabbadelight.regionalmeals.model.enums.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {

    private Long orderId;
    private PaymentMode paymentMode;
    private PaymentStatus paymentStatus;
    private OrderStatus orderStatus;

    //user info;
    private Long userId;
    private String userName;
    private String userEmail;

    //address info
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String pincode;

    //order items;

    private List<OrderItemDTO> items;
    private double totalAmount;

     private LocalDateTime createdAt;   // Add this field
    private LocalDateTime updatedAt; 

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDTO {
        
        private Long orderItemId;
        private Long itemId;
        private String itemName;
        private int quantity;
        private double price;
        private double total;
        private boolean veg;
    }

}
