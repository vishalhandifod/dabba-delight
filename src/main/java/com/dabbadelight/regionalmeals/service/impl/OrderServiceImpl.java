package com.dabbadelight.regionalmeals.service.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dabbadelight.regionalmeals.exception.ResourceNotFoundException;
import com.dabbadelight.regionalmeals.model.DTO.OrderRequestDTO;
import com.dabbadelight.regionalmeals.model.DTO.OrderResponseDTO;
import com.dabbadelight.regionalmeals.model.Kitchen.Item;
import com.dabbadelight.regionalmeals.model.Orders.Order;
import com.dabbadelight.regionalmeals.model.Orders.OrderItem;
import com.dabbadelight.regionalmeals.model.User.Address;
import com.dabbadelight.regionalmeals.model.User.User;
import com.dabbadelight.regionalmeals.model.enums.OrderStatus;
import com.dabbadelight.regionalmeals.model.enums.PaymentMode;
import com.dabbadelight.regionalmeals.model.enums.PaymentStatus;
import com.dabbadelight.regionalmeals.repository.AddressRepository;
import com.dabbadelight.regionalmeals.repository.OrderItemRepository;
import com.dabbadelight.regionalmeals.repository.OrderRepository;
import com.dabbadelight.regionalmeals.repository.UserRepository;
import com.dabbadelight.regionalmeals.service.ItemService;
import com.dabbadelight.regionalmeals.service.OrderService;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final OrderItemRepository orderItemRepository;
    private final ItemService itemService; // Use ItemService instead of ItemRepository directly

    public OrderServiceImpl(OrderRepository orderRepository, UserRepository userRepository, 
                          AddressRepository addressRepository, OrderItemRepository orderItemRepository, 
                          ItemService itemService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.orderItemRepository = orderItemRepository;
        this.itemService = itemService;
    }

    @Override
    @Transactional
    public OrderResponseDTO createOrder(OrderRequestDTO request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        // Validate all items exist and have sufficient stock
        for (OrderRequestDTO.OrderItemRequestDTO reqItem : request.getOrderItems()) {
            Item item = itemService.getItemById(reqItem.getItemId());
            if (!item.isAvailable()) {
                throw new IllegalArgumentException("Item " + item.getName() + " is not available");
            }
            if (item.getStock() < reqItem.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for item " + item.getName() + 
                    ". Available: " + item.getStock() + ", Requested: " + reqItem.getQuantity());
            }
        }

        Order order = new Order();
        order.setUser(user);
        order.setPaymentMode(request.getPaymentMode());
        order.setPaymentStatus(request.getPaymentStatus());
        order.setOrderStatus(request.getOrderStatus());

        List<OrderItem> orderItems = request.getOrderItems().stream().map(reqItem -> {
            Item item = itemService.getItemById(reqItem.getItemId());

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setItem(item);
            orderItem.setQuantity(reqItem.getQuantity());
            orderItem.setPriceAtPurchase(reqItem.getPriceAtPurchase());
            return orderItem;
        }).collect(Collectors.toList());

        order.setOrderItems(orderItems);
        order.calculateTotalAmount();

        Order savedOrder = orderRepository.save(order);

        // Update stock for all items
        for (OrderRequestDTO.OrderItemRequestDTO reqItem : request.getOrderItems()) {
            Item item = itemService.getItemById(reqItem.getItemId());
            int newStock = item.getStock() - reqItem.getQuantity();
            itemService.updateStock(item.getId(), newStock, "SYSTEM");
        }

        return toOrderResponseDTO(savedOrder);
    }

    @Override
    public OrderResponseDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        return toOrderResponseDTO(order);
    }

    @Override
    public List<OrderResponseDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::toOrderResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderResponseDTO> getOrdersByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toOrderResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderResponseDTO> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByOrderStatusOrderByCreatedAtDesc(status).stream()
                .map(this::toOrderResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Order updateOrder(Long id, Order orderDetails) {
        Order existingOrder = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        
        existingOrder.setPaymentMode(orderDetails.getPaymentMode());
        existingOrder.setPaymentStatus(orderDetails.getPaymentStatus());
        existingOrder.setOrderStatus(orderDetails.getOrderStatus());
        existingOrder.calculateTotalAmount();
        
        return orderRepository.save(existingOrder);
    }

    @Override
    @Transactional
    public Order updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        
        // If order is being cancelled, restore stock
        if (status == OrderStatus.CANCELLED && order.getOrderStatus() != OrderStatus.CANCELLED) {
            for (OrderItem orderItem : order.getOrderItems()) {
                Item item = orderItem.getItem();
                int newStock = item.getStock() + orderItem.getQuantity();
                itemService.updateStock(item.getId(), newStock, "SYSTEM");
            }
        }
        
        order.setOrderStatus(status);
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        
        // Restore stock when deleting order
        if (order.getOrderStatus() != OrderStatus.CANCELLED) {
            for (OrderItem orderItem : order.getOrderItems()) {
                Item item = orderItem.getItem();
                int newStock = item.getStock() + orderItem.getQuantity();
                itemService.updateStock(item.getId(), newStock, "SYSTEM");
            }
        }
        
        orderRepository.delete(order);
    }

    @Override
    public Order getOrCreatePendingOrderByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<Order> existingPendingOrders = orderRepository.findByUserAndOrderStatus(user, OrderStatus.PENDING);

        if (!existingPendingOrders.isEmpty()) {
            return existingPendingOrders.get(0);
        } else {
            Order newOrder = new Order();
            newOrder.setUser(user);
            newOrder.setOrderStatus(OrderStatus.PENDING);
            newOrder.setPaymentMode(PaymentMode.CASH);
            newOrder.setPaymentStatus(PaymentStatus.PENDING);
            newOrder.setTotalAmount(0);
            return orderRepository.save(newOrder);
        }
    }

    @Override
    @Transactional
    public Order addItemToOrder(Long orderId, Long itemId, int quantity) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        
        Item item = itemService.getItemById(itemId);
        
        if (!item.isAvailable()) {
            throw new IllegalArgumentException("Item " + item.getName() + " is not available");
        }

        Optional<OrderItem> existingOrderItem = order.getOrderItems().stream()
                .filter(oi -> oi.getItem().getId().equals(itemId))
                .findFirst();

        if (existingOrderItem.isPresent()) {
            OrderItem orderItem = existingOrderItem.get();
            int oldQuantity = orderItem.getQuantity();
            int quantityDifference = quantity - oldQuantity;
            
            if (quantityDifference > 0 && item.getStock() < quantityDifference) {
                throw new IllegalArgumentException("Insufficient stock. Available: " + item.getStock());
            }
            
            orderItem.setQuantity(quantity);
            orderItemRepository.save(orderItem);
            
            // Update stock
            if (quantityDifference != 0) {
                int newStock = item.getStock() - quantityDifference;
                itemService.updateStock(item.getId(), newStock, "SYSTEM");
            }
        } else {
            if (item.getStock() < quantity) {
                throw new IllegalArgumentException("Insufficient stock. Available: " + item.getStock());
            }
            
            OrderItem newOrderItem = new OrderItem();
            newOrderItem.setOrder(order);
            newOrderItem.setItem(item);
            newOrderItem.setQuantity(quantity);
            newOrderItem.setPriceAtPurchase(item.getPrice());
            order.getOrderItems().add(newOrderItem);
            
            // Update stock
            int newStock = item.getStock() - quantity;
            itemService.updateStock(item.getId(), newStock, "SYSTEM");
        }
        
        order.calculateTotalAmount();
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order removeItemFromOrder(Long orderId, Long orderItemId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        
        OrderItem orderItemToRemove = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new ResourceNotFoundException("OrderItem", "id", orderItemId));

        if (!order.getOrderItems().remove(orderItemToRemove)) {
            throw new IllegalArgumentException("Order item not found in the specified order.");
        }
        
        // Restore stock
        Item item = orderItemToRemove.getItem();
        int newStock = item.getStock() + orderItemToRemove.getQuantity();
        itemService.updateStock(item.getId(), newStock, "SYSTEM");
        
        orderItemRepository.delete(orderItemToRemove);
        order.calculateTotalAmount();
        return orderRepository.save(order);
    }

    private OrderResponseDTO toOrderResponseDTO(Order order) {
        User user = order.getUser();
        List<Address> addresses = addressRepository.findByUserId(user.getId());
        Address address = addresses.isEmpty() ? null : addresses.get(0);

        List<OrderResponseDTO.OrderItemDTO> orderItemDTOs = order.getOrderItems()
                .stream()
                .map(this::toOrderItemDTO)
                .collect(Collectors.toList());

        return OrderResponseDTO.builder()
                .orderId(order.getId())
                .paymentMode(order.getPaymentMode())
                .paymentStatus(order.getPaymentStatus())
                .orderStatus(order.getOrderStatus())
                .userId(user.getId())
                .userName(user.getName())
                .userEmail(user.getEmail())
                .addressLine1(address != null ? address.getAddressLine1() : null)
                .addressLine2(address != null ? address.getAddressLine2() : null)
                .city(address != null ? address.getCity() : null)
                .pincode(address != null ? address.getPincode() : null)
                .items(orderItemDTOs)
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private OrderResponseDTO.OrderItemDTO toOrderItemDTO(OrderItem orderItem) {
        return OrderResponseDTO.OrderItemDTO.builder()
                .itemId(orderItem.getItem().getId())
                .itemName(orderItem.getItem().getName())
                .quantity(orderItem.getQuantity())
                .price(orderItem.getPriceAtPurchase())
                .total(orderItem.getQuantity() * orderItem.getPriceAtPurchase())
                .veg(orderItem.getItem().isVeg())
                .build();
    }
}