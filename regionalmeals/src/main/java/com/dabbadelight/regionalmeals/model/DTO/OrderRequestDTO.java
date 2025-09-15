package com.dabbadelight.regionalmeals.model.DTO;

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
public class OrderRequestDTO {

    private Long userId;  // ✅ send only ID, not whole user object
    private PaymentMode paymentMode;
    private PaymentStatus paymentStatus;
    private OrderStatus orderStatus;

    private List<OrderItemRequestDTO> orderItems;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequestDTO {
        private Long itemId;
        private int quantity;
        private int priceAtPurchase;
    }
}
