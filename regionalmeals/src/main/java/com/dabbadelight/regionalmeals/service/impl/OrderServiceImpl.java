package com.dabbadelight.regionalmeals.service.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dabbadelight.regionalmeals.model.DTO.OrderRequestDTO;
import com.dabbadelight.regionalmeals.model.DTO.OrderResponseDTO;
import com.dabbadelight.regionalmeals.model.Orders.Order;
import com.dabbadelight.regionalmeals.model.Orders.OrderItem;
import com.dabbadelight.regionalmeals.model.User.Address;
import com.dabbadelight.regionalmeals.model.User.User;
import com.dabbadelight.regionalmeals.model.enums.OrderStatus;
import com.dabbadelight.regionalmeals.model.enums.PaymentMode;
import com.dabbadelight.regionalmeals.model.enums.PaymentStatus;
import com.dabbadelight.regionalmeals.repository.AddressRepository;
import com.dabbadelight.regionalmeals.repository.ItemRepository;
import com.dabbadelight.regionalmeals.repository.OrderItemRepository;
import com.dabbadelight.regionalmeals.repository.OrderRepository;
import com.dabbadelight.regionalmeals.repository.UserRepository;
import com.dabbadelight.regionalmeals.service.OrderService;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final OrderItemRepository orderItemRepository;
    private final ItemRepository itemRepository;

    public OrderServiceImpl(OrderRepository orderRepository, UserRepository userRepository, AddressRepository addressRepository, OrderItemRepository orderItemRepository, ItemRepository itemRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.orderItemRepository = orderItemRepository;
        this.itemRepository = itemRepository;
    }

    @Override
    @Transactional
    public OrderResponseDTO createOrder(OrderRequestDTO request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = new Order();
        order.setUser(user);
        order.setPaymentMode(request.getPaymentMode());
        order.setPaymentStatus(request.getPaymentStatus());
        order.setOrderStatus(request.getOrderStatus());

        List<OrderItem> orderItems = request.getOrderItems().stream().map(reqItem -> {
            com.dabbadelight.regionalmeals.model.Kitchen.Item item = itemRepository.findById(reqItem.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item not found"));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setItem(item);
            orderItem.setQuantity(reqItem.getQuantity());
            orderItem.setPriceAtPurchase(reqItem.getPriceAtPurchase());
            return orderItem;
        }).collect(Collectors.toList());

        order.setOrderItems(orderItems);
        order.calculateTotalAmount();

        Order saved = orderRepository.save(order);

        return toOrderResponseDTO(saved); // reuse your mapper
    }


    @Override
    public OrderResponseDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        return toOrderResponseDTO(order);
    }

    @Override
    public List<OrderResponseDTO> getAllOrders() {
        return orderRepository.findAll().stream().map(this::toOrderResponseDTO).collect(Collectors.toList());
    }

    @Override
    public Order updateOrder(Long id, Order order) {
        Order existingOrder = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        existingOrder.setPaymentMode(order.getPaymentMode());
        existingOrder.setPaymentStatus(order.getPaymentStatus());
        existingOrder.setOrderStatus(order.getOrderStatus());
        existingOrder.calculateTotalAmount();
        return orderRepository.save(existingOrder);
    }

    @Override
    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }

    @Override
    public Order getOrCreatePendingOrderByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Order> existingPendingOrders = orderRepository.findByUserAndOrderStatus(user, OrderStatus.PENDING);

        if (!existingPendingOrders.isEmpty()) {
            return existingPendingOrders.get(0); // or apply business logic to pick one
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
                .orElseThrow(() -> new RuntimeException("Order not found"));
        com.dabbadelight.regionalmeals.model.Kitchen.Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        Optional<OrderItem> existingOrderItem = order.getOrderItems().stream()
                .filter(oi -> oi.getItem().getId().equals(itemId))
                .findFirst();

        if (existingOrderItem.isPresent()) {
            OrderItem orderItem = existingOrderItem.get();
            orderItem.setQuantity(quantity);
            orderItemRepository.save(orderItem);
        } else {
            OrderItem newOrderItem = new OrderItem();
            newOrderItem.setOrder(order);
            newOrderItem.setItem(item);
            newOrderItem.setQuantity(quantity);
            newOrderItem.setPriceAtPurchase(item.getPrice()); // Assuming Item has a getPrice() method
            order.getOrderItems().add(newOrderItem);
        }
        order.calculateTotalAmount();
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order removeItemFromOrder(Long orderId, Long orderItemId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        OrderItem orderItemToRemove = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("Order Item not found"));

        if (!order.getOrderItems().remove(orderItemToRemove)) {
            throw new RuntimeException("Order item not found in the specified order.");
        }
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
                .build();
    }


    private OrderResponseDTO.OrderItemDTO toOrderItemDTO(OrderItem orderItem) {
        return OrderResponseDTO.OrderItemDTO.builder()
                .itemId(orderItem.getItem().getId())
                .itemName(orderItem.getItem().getName())
                .quantity(orderItem.getQuantity())
                .price(orderItem.getPriceAtPurchase())
                .total(orderItem.getQuantity() * orderItem.getPriceAtPurchase())
                .build();
    }
}
