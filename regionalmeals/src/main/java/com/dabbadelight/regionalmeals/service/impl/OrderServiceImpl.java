package com.dabbadelight.regionalmeals.service.impl;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.dabbadelight.regionalmeals.model.enums.Role;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.mail.javamail.MimeMessageHelper;
import com.dabbadelight.regionalmeals.exception.ResourceNotFoundException;
import com.dabbadelight.regionalmeals.model.DTO.OrderRequestDTO;
import com.dabbadelight.regionalmeals.model.DTO.OrderResponseDTO;
import com.dabbadelight.regionalmeals.model.Kitchen.Item;
import com.dabbadelight.regionalmeals.model.Kitchen.Menu;
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

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import com.dabbadelight.regionalmeals.repository.MenuRepository;
import org.springframework.beans.factory.annotation.Value;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final OrderItemRepository orderItemRepository;
    private final ItemService itemService;
    private final MenuRepository menuRepository;
    private final JavaMailSender mailSender;
    @Value("${otp.mail.from}")
    private String verifiedFromEmail; 

    public OrderServiceImpl(OrderRepository orderRepository, UserRepository userRepository,
                            AddressRepository addressRepository, OrderItemRepository orderItemRepository,
                            ItemService itemService, MenuRepository menuRepository, JavaMailSender mailSender) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.orderItemRepository = orderItemRepository;
        this.itemService = itemService;
        this.menuRepository = menuRepository;
        this.mailSender = mailSender;
      
    }

    // ========================= Helper Methods =========================

    /**
     * Adjusts the stock of an item.
     * @param item the item to adjust
     * @param change positive to increase, negative to decrease
     */
    private void adjustStock(Item item, int change) {
        int newStock = item.getStock() + change;
        itemService.updateStock(item.getId(), newStock, "SYSTEM");
    }

    /**
     * Maps OrderItem entity to DTO.
     */
    private OrderResponseDTO.OrderItemDTO toOrderItemDTO(OrderItem orderItem) {
        return OrderResponseDTO.OrderItemDTO.builder()
                .orderItemId(orderItem.getId())
                .itemId(orderItem.getItem().getId())
                .itemName(orderItem.getItem().getName())
                .quantity(orderItem.getQuantity())
                .price(orderItem.getPriceAtPurchase())
                .total(orderItem.getQuantity() * orderItem.getPriceAtPurchase())
                .veg(orderItem.getItem().isVeg())
                .build();
    }

    /**
     * Maps Order entity to OrderResponseDTO.
     * Converts entity relationships (User, Address, OrderItems) to DTO.
     */
private OrderResponseDTO toOrderResponseDTO(Order order) {
    try {
        User user = order.getUser();
        Address address = order.getAddress();

        // Safely handle order items to prevent circular references
        List<OrderResponseDTO.OrderItemDTO> orderItemDTOs = Collections.emptyList();
        try {
            if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
                orderItemDTOs = order.getOrderItems().stream()
                        .map(this::toOrderItemDTOSafe)
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            System.err.println("Error loading order items: " + e.getMessage());
            // Continue without order items rather than failing
        }

        Long adminId = null;
        try {
            if (order.getAdmin() != null) {
                adminId = order.getAdmin().getId();
            }
        } catch (Exception e) {
            System.err.println("Error loading admin: " + e.getMessage());
        }

        return OrderResponseDTO.builder()
                .orderId(order.getId())
                .paymentMode(order.getPaymentMode())
                .paymentStatus(order.getPaymentStatus())
                .orderStatus(order.getOrderStatus())
                .userId(user != null ? user.getId() : null)
                .userName(user != null ? user.getName() : null)
                .userEmail(user != null ? user.getEmail() : null)
                .adminId(adminId)
                .addressLine1(address != null ? address.getAddressLine1() : null)
                .addressLine2(address != null ? address.getAddressLine2() : null)
                .city(address != null ? address.getCity() : null)
                .pincode(address != null ? address.getPincode() : null)
                .items(orderItemDTOs)
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    } catch (Exception e) {
        System.err.println("Error in toOrderResponseDTO: " + e.getMessage());
        e.printStackTrace();
        throw e;
    }
}
    private OrderResponseDTO.OrderItemDTO toOrderItemDTOSafe(OrderItem orderItem) {
    try {
        OrderResponseDTO.OrderItemDTO.OrderItemDTOBuilder builder = OrderResponseDTO.OrderItemDTO.builder()
                .orderItemId(orderItem.getId())
                .quantity(orderItem.getQuantity())
                .price(orderItem.getPriceAtPurchase())
                .total(orderItem.getQuantity() * orderItem.getPriceAtPurchase());

        // Safely handle item relationship
        try {
            if (orderItem.getItem() != null) {
                Item item = orderItem.getItem();
                builder.itemId(item.getId())
                       .itemName(item.getName())
                       .veg(item.isVeg());
            }
        } catch (Exception e) {
            System.err.println("Error loading item details: " + e.getMessage());
            // Continue with basic order item info
        }

        return builder.build();
    } catch (Exception e) {
        System.err.println("Error in toOrderItemDTOSafe: " + e.getMessage());
        throw e;
    }
}
    /**
     * Retrieves the currently logged-in user based on Spring Security context.
     */
    @Override
    public User getCurrentLoggedInUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email;

        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    // ========================= CRUD Operations =========================

    /**
     * Creates a new order.
     */
    @Override
    @Transactional
    public OrderResponseDTO createOrder(OrderRequestDTO request) {

        // ✅ Fetch the currently logged-in user
        User currentUser = getCurrentLoggedInUser();

        // Fetch address
        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", request.getAddressId()));
        Menu menu = null;
            if (request.getAdminId() != null) {
                menu = menuRepository.findById(request.getAdminId())
                        .orElseThrow(() -> new ResourceNotFoundException("Admin", "id", request.getAdminId()));
            }

        // Validate stock & availability
        for (OrderRequestDTO.OrderItemRequestDTO reqItem : request.getOrderItems()) {
            Item item = itemService.getItemById(reqItem.getItemId());
            if (!item.isAvailable())
                throw new IllegalArgumentException("Item " + item.getName() + " is not available");
            if (item.getStock() < reqItem.getQuantity())
                throw new IllegalArgumentException("Insufficient stock for " + item.getName());
        }

        // Create Order entity
        Order order = new Order();
        order.setUser(currentUser); // ⚡ always use logged-in user
        order.setAddress(address);
         order.setAdmin(menu);
        order.setPaymentMode(request.getPaymentMode() != null ? request.getPaymentMode() : PaymentMode.CASH);
        order.setPaymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus() : PaymentStatus.PENDING);
        order.setOrderStatus(OrderStatus.PENDING);

        // Map order items
        List<OrderItem> orderItems = request.getOrderItems().stream().map(reqItem -> {
            Item item = itemService.getItemById(reqItem.getItemId());
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setItem(item);
            orderItem.setQuantity(reqItem.getQuantity());
            orderItem.setPriceAtPurchase(item.getPrice());
            return orderItem;
        }).collect(Collectors.toList());

        order.setOrderItems(orderItems);
        order.calculateTotalAmount();

        // Save order
        Order savedOrder = orderRepository.save(order);

        // Deduct stock
        request.getOrderItems().forEach(reqItem -> {
            Item item = itemService.getItemById(reqItem.getItemId());
            adjustStock(item, -reqItem.getQuantity());
        });

        return toOrderResponseDTO(savedOrder);
    }


    /**
     * Get order by ID
     */
    @Override
    public OrderResponseDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        return toOrderResponseDTO(order);
    }

    /**
     * Get all orders
     */
    @Override
    public List<OrderResponseDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::toOrderResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get orders by a specific user
     */
    @Override
    public List<OrderResponseDTO> getOrdersByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toOrderResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get orders by status
     */
    @Override
    public List<OrderResponseDTO> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByOrderStatusOrderByCreatedAtDesc(status).stream()
                .map(this::toOrderResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update order details (payment & status)
     */
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

    /**
     * Update order status with role check
     */
    @Override
    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus status, User currentUser) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // Only admin can update
        if (currentUser.getRole() != Role.ADMIN) throw new SecurityException("Not authorized");

        // Restore stock if cancelling
        if (status == OrderStatus.CANCELLED && order.getOrderStatus() != OrderStatus.CANCELLED) {
            for (OrderItem orderItem : order.getOrderItems()) {
                adjustStock(orderItem.getItem(), orderItem.getQuantity());
            }
        }

        order.setOrderStatus(status);

        return orderRepository.save(order);
    }


    /**
     * Delete order and restore stock if needed
     */
    @Override
    @Transactional
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        order.getOrderItems().size(); // initialize lazy list

        if (order.getOrderStatus() != OrderStatus.CANCELLED) {
            for (OrderItem orderItem : order.getOrderItems()) {
                adjustStock(orderItem.getItem(), orderItem.getQuantity());
            }
        }

        orderRepository.delete(order);
    }

    /**
     * Get existing pending order or create a new one
     */
    @Override
    public Order getOrCreatePendingOrderByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<Order> existingPendingOrders = orderRepository.findByUserAndOrderStatus(user, OrderStatus.PENDING);
        if (!existingPendingOrders.isEmpty()) return existingPendingOrders.get(0);

        Order newOrder = new Order();
        newOrder.setUser(user);
        newOrder.setOrderStatus(OrderStatus.PENDING);
        newOrder.setPaymentMode(PaymentMode.CASH);
        newOrder.setPaymentStatus(PaymentStatus.PENDING);
        newOrder.setTotalAmount(0);

        return orderRepository.save(newOrder);
    }

    /**
     * Add an item to an existing order
     */
    @Override
    @Transactional
    public Order addItemToOrder(Long orderId, Long itemId, int quantity) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        Item item = itemService.getItemById(itemId);

        if (!item.isAvailable()) throw new IllegalArgumentException("Item not available");

        Optional<OrderItem> existingOrderItem = order.getOrderItems().stream()
                .filter(oi -> oi.getItem().getId().equals(itemId))
                .findFirst();

        if (existingOrderItem.isPresent()) {
            // Update quantity
            OrderItem orderItem = existingOrderItem.get();
            int diff = quantity - orderItem.getQuantity();
            if (diff > 0 && item.getStock() < diff)
                throw new IllegalArgumentException("Insufficient stock");

            orderItem.setQuantity(quantity);
            orderItemRepository.save(orderItem);

            if (diff != 0) adjustStock(item, -diff);
        } else {
            if (item.getStock() < quantity) throw new IllegalArgumentException("Insufficient stock");

            OrderItem newOrderItem = new OrderItem();
            newOrderItem.setOrder(order);
            newOrderItem.setItem(item);
            newOrderItem.setQuantity(quantity);
            newOrderItem.setPriceAtPurchase(item.getPrice());
            order.getOrderItems().add(newOrderItem);

            adjustStock(item, -quantity);
        }

        order.calculateTotalAmount();
        return orderRepository.save(order);
    }

    /**
     * Remove an item from an order
     */
    @Override
    @Transactional
    public Order removeItemFromOrder(Long orderId, Long orderItemId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        OrderItem orderItemToRemove = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new ResourceNotFoundException("OrderItem", "id", orderItemId));

        if (!order.getOrderItems().remove(orderItemToRemove))
            throw new IllegalArgumentException("Order item not found in order");

        adjustStock(orderItemToRemove.getItem(), orderItemToRemove.getQuantity());
        orderItemRepository.delete(orderItemToRemove);

        order.calculateTotalAmount();
        return orderRepository.save(order);
    }

@Override
@Transactional(readOnly = true)
public List<OrderResponseDTO> getOrdersForAdmin(String adminEmail) {
    try {
        // Find all menus created by this admin (by email)
        List<Menu> menus = menuRepository.findByCreatedBy(adminEmail);
        System.out.println("Menus found for admin: " + menus.size());
        
        if (menus.isEmpty()) {
            return Collections.emptyList();
        }

        // Extract menu IDs
        List<Long> menuIds = menus.stream()
                                  .map(Menu::getId)
                                  .collect(Collectors.toList());
        System.out.println("Menu IDs: " + menuIds);
        
        // Use the new method with JOIN FETCH to avoid lazy loading issues
        List<Order> orders = orderRepository.findOrdersByMenuIdsWithDetails(menuIds);
        System.out.println("Orders found: " + orders.size());
        
        return orders.stream()
                     .map(this::toOrderResponseDTO)
                     .collect(Collectors.toList());
                     
    } catch (Exception e) {
        System.err.println("Error in getOrdersForAdmin: " + e.getMessage());
        e.printStackTrace();
        throw e;
    }
}

    @Override
    public Order getOrderEntityById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }


    // email functionality
     @Override
    @Async
    public void sendOrderStatusUpdateEmail(Order order, OrderStatus newStatus) {
        try {
            User customer = order.getUser();
            if (customer == null || customer.getEmail() == null) {
                System.out.println("❌ Cannot send email: Customer or email not found");
                return;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String fromEmail = verifiedFromEmail;
            String fromName = "Dabba Delight";

            try {
                helper.setFrom(fromEmail, fromName);
            } catch (java.io.UnsupportedEncodingException e) {
                System.out.println("❌ Invalid encoding for sender name. Using email only.");
                helper.setFrom(fromEmail);
            }

            helper.setTo(customer.getEmail());
            helper.setSubject("📦 Order Status Update - Order #" + order.getId());

            String htmlContent = buildOrderStatusEmailContent(order, newStatus);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            System.out.println("✅ Order status update email sent to: " + customer.getEmail());

        } catch (MessagingException  e) {
            System.out.println("❌ Failed to send order status email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String buildOrderStatusEmailContent(Order order, OrderStatus newStatus) {
        String statusMessage = getStatusMessage(newStatus);
        String statusColor = getStatusColor(newStatus);
        String statusEmoji = getStatusEmoji(newStatus);
        
        return String.format("""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: #f7f9fc; border: 1px solid #e1e4e8;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #ff6b35; margin: 0;">🍽️ Dabba Delight</h1>
                    <p style="color: #666; margin: 5px 0;">Delicious meals delivered fresh</p>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Order Status Update</h2>
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <div style="background: %s; color: white; padding: 15px; border-radius: 25px; display: inline-block; font-size: 18px; font-weight: bold;">
                            %s %s
                        </div>
                    </div>
                    
                    <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
                        <h3 style="color: #333; margin-bottom: 15px;">Order Details:</h3>
                        <p><strong>Order ID:</strong> #%d</p>
                        <p><strong>Total Amount:</strong> ₹%.2f</p>
                        <p><strong>Order Date:</strong> %s</p>
                        <p><strong>Payment Mode:</strong> %s</p>
                    </div>
                    
                    %s
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <p style="color: #666; font-size: 14px;">%s</p>
                    </div>
                </div>
                
                <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; margin-top: 20px;">
                    <p style="color: #666; margin: 0; font-size: 14px;">
                        Thank you for choosing Dabba Delight! 🙏<br>
                        For any questions, contact us at support@dabbadelight.com
                    </p>
                </div>
            </div>
            """, 
            statusColor,
            statusEmoji, newStatus.toString(),
            order.getId(),
            order.getTotalAmount(),
            order.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")),
            order.getPaymentMode(),
            buildOrderItemsSection(order),
            statusMessage
        );
    }

    private String buildOrderItemsSection(Order order) {
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            return "";
        }

        StringBuilder itemsHtml = new StringBuilder();
        itemsHtml.append("<div style='border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;'>");
        itemsHtml.append("<h3 style='color: #333; margin-bottom: 15px;'>Items Ordered:</h3>");
        itemsHtml.append("<table style='width: 100%; border-collapse: collapse;'>");
        
        for (OrderItem item : order.getOrderItems()) {
            itemsHtml.append(String.format("""
                <tr style='border-bottom: 1px solid #f0f0f0;'>
                    <td style='padding: 8px 0; color: #333;'>%s</td>
                    <td style='padding: 8px 0; text-align: center; color: #666;'>x%d</td>
                    <td style='padding: 8px 0; text-align: right; color: #333; font-weight: bold;'>₹%.2f</td>
                </tr>
                """,
                item.getItem() != null ? item.getItem().getName() : "Unknown Item",
                item.getQuantity(),
                item.getPriceAtPurchase() * item.getQuantity()
            ));
        }
        
        itemsHtml.append("</table>");
        itemsHtml.append("</div>");
        return itemsHtml.toString();
    }

    private String getStatusMessage(OrderStatus status) {
        return switch (status) {
            case PENDING -> "Your order has been received and is being processed.";
            case CONFIRMED -> "Great news! Your order has been confirmed and will be prepared soon.";
            case PREPARING -> "Our chefs are busy preparing your delicious meal!";
            case OUT_FOR_DELIVERY -> "Your order is on the way! Our delivery partner will be with you soon.";
            case DELIVERED -> "Your order has been delivered! We hope you enjoy your meal.";
            case CANCELLED -> "Your order has been cancelled. If you have any questions, please contact us.";
        };
    }

    private String getStatusColor(OrderStatus status) {
        return switch (status) {
            case PENDING -> "#fbbf24";      // Yellow
            case CONFIRMED -> "#3b82f6";    // Blue
            case PREPARING -> "#f97316";    // Orange
            case OUT_FOR_DELIVERY -> "#8b5cf6"; // Purple
            case DELIVERED -> "#10b981";    // Green
            case CANCELLED -> "#ef4444";    // Red
        };
    }

    private String getStatusEmoji(OrderStatus status) {
        return switch (status) {
            case PENDING -> "⏳";
            case CONFIRMED -> "✅";
            case PREPARING -> "👨‍🍳";
            case OUT_FOR_DELIVERY -> "🚚";
            case DELIVERED -> "🎉";
            case CANCELLED -> "❌";
        };
    }
    @Override
@Async
public void sendOrderConfirmationEmail(Long orderId) {
    try {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        System.out.println("Sending order confirmation email for Order ID: " + orderId);
        // Send confirmation to customer
        sendCustomerOrderConfirmation(order);
        
        // Send notification to admin/restaurant
        sendAdminOrderNotification(order);
        
    } catch (Exception e) {
        System.out.println("Error sending order confirmation emails: " + e.getMessage());
        e.printStackTrace();
    }
}

private void sendCustomerOrderConfirmation(Order order) {
    try {
        User customer = order.getUser();
        if (customer == null || customer.getEmail() == null) {
            System.out.println("Cannot send customer confirmation: Customer or email not found");
            return;
        }

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        String fromEmail = verifiedFromEmail;
        String fromName = "Dabba Delight";

        try {
            helper.setFrom(fromEmail, fromName);
        } catch (java.io.UnsupportedEncodingException e) {
            System.out.println("Invalid encoding for sender name. Using email only.");
            helper.setFrom(fromEmail);
        }

        helper.setTo(customer.getEmail());
        helper.setSubject("Order Confirmation - Order #" + order.getId());

        String htmlContent = buildCustomerConfirmationEmailContent(order);
        helper.setText(htmlContent, true);
        
        mailSender.send(message);
        System.out.println("Order confirmation email sent to customer: " + customer.getEmail());

    } catch (MessagingException e) {
        System.out.println("Failed to send customer confirmation email: " + e.getMessage());
        e.printStackTrace();
    }
}

private void sendAdminOrderNotification(Order order) {
    try {
        // Get admin email from the menu/restaurant
        if (order.getAdmin() != null && order.getAdmin().getCreatedBy() != null) {
            String adminEmail = order.getAdmin().getCreatedBy();
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(verifiedFromEmail, "Dabba Delight");
            helper.setTo(adminEmail);
            helper.setSubject("New Order Received - Order #" + order.getId());
            
            String htmlContent = buildAdminOrderNotificationContent(order);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            System.out.println("Admin order notification sent to: " + adminEmail);
        }
    } catch (Exception e) {
        System.out.println("Failed to send admin notification: " + e.getMessage());
        e.printStackTrace();
    }
}

private String buildCustomerConfirmationEmailContent(Order order) {
    return String.format("""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: #f7f9fc; border: 1px solid #e1e4e8;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #ff6b35; margin: 0;">Dabba Delight</h1>
                <p style="color: #666; margin: 5px 0;">Delicious meals delivered fresh</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Order Confirmation</h2>
                
                <div style="text-align: center; margin: 20px 0;">
                    <div style="background: #10b981; color: white; padding: 15px; border-radius: 25px; display: inline-block; font-size: 18px; font-weight: bold;">
                        Order Placed Successfully!
                    </div>
                </div>
                
                <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
                    <h3 style="color: #333; margin-bottom: 15px;">Order Details:</h3>
                    <p><strong>Order ID:</strong> #%d</p>
                    <p><strong>Order Date:</strong> %s</p>
                    <p><strong>Payment Mode:</strong> %s</p>
                    <p><strong>Payment Status:</strong> %s</p>
                    <p><strong>Order Status:</strong> %s</p>
                </div>
                
                %s
                
                %s
                
                <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #1d4ed8; margin-bottom: 10px;">Total Amount</h3>
                    <p style="font-size: 24px; font-weight: bold; color: #1d4ed8; margin: 0;">₹%.2f</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0; padding: 20px; background: #fef3c7; border-radius: 8px;">
                    <p style="color: #92400e; margin: 0; font-weight: bold;">
                        Your order is being processed and you'll receive updates via email.
                    </p>
                </div>
            </div>
            
            <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; margin-top: 20px;">
                <p style="color: #666; margin: 0; font-size: 14px;">
                    Thank you for choosing Dabba Delight!<br>
                    For any questions, contact us at support@dabbadelight.com
                </p>
            </div>
        </div>
        """, 
        order.getId(),
        order.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")),
        order.getPaymentMode(),
        order.getPaymentStatus(),
        order.getOrderStatus(),
        buildOrderItemsSection(order),
        buildDeliveryAddressSection(order),
        order.getTotalAmount()
    );
}

private String buildAdminOrderNotificationContent(Order order) {
    return String.format("""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: #f7f9fc; border: 1px solid #e1e4e8;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #ff6b35; margin: 0;">Dabba Delight - Admin Panel</h1>
                <p style="color: #666; margin: 5px 0;">Restaurant Management System</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #333; text-align: center; margin-bottom: 20px;">New Order Received</h2>
                
                <div style="text-align: center; margin: 20px 0;">
                    <div style="background: #3b82f6; color: white; padding: 15px; border-radius: 25px; display: inline-block; font-size: 18px; font-weight: bold;">
                        Order #%d
                    </div>
                </div>
                
                <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
                    <h3 style="color: #333; margin-bottom: 15px;">Order Information:</h3>
                    <p><strong>Order ID:</strong> #%d</p>
                    <p><strong>Customer:</strong> %s</p>
                    <p><strong>Customer Email:</strong> %s</p>
                    <p><strong>Order Date:</strong> %s</p>
                    <p><strong>Payment Mode:</strong> %s</p>
                    <p><strong>Total Amount:</strong> ₹%.2f</p>
                </div>
                
                %s
                
                %s
                
                <div style="text-align: center; margin: 30px 0; padding: 20px; background: #fef3c7; border-radius: 8px;">
                    <p style="color: #92400e; margin: 0; font-weight: bold;">
                        Please process this order and update the status accordingly.
                    </p>
                </div>
            </div>
            
            <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; margin-top: 20px;">
                <p style="color: #666; margin: 0; font-size: 14px;">
                    Login to your admin panel to manage orders<br>
                    Dabba Delight Restaurant Management
                </p>
            </div>
        </div>
        """, 
        order.getId(),
        order.getId(),
        order.getUser() != null ? order.getUser().getName() : "Unknown Customer",
        order.getUser() != null ? order.getUser().getEmail() : "Unknown Email",
        order.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")),
        order.getPaymentMode(),
        order.getTotalAmount(),
        buildOrderItemsSection(order),
        buildDeliveryAddressSection(order)
    );
}

private String buildDeliveryAddressSection(Order order) {
    if (order.getAddress() == null) {
        return "";
    }
    
    Address address = order.getAddress();
    return String.format("""
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
            <h3 style="color: #333; margin-bottom: 15px;">Delivery Address:</h3>
            <p style="color: #666; line-height: 1.5;">
                %s<br>
                %s
                %s, %s
            </p>
        </div>
        """,
        address.getAddressLine1(),
        address.getAddressLine2() != null ? address.getAddressLine2() + "<br>" : "",
        address.getCity(),
        address.getPincode()
    );
}
}



