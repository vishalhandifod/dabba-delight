import React, { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Package, Clock, CheckCircle, Truck, MapPin, User, CreditCard } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { use } from 'react';
const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { toast } = useToast();
  const {session} = useAuth();
  useEffect(() => {
    fetchOrders();

  }, []);

const userRole = useMemo(() => {
    return session?.role || 'ROLE_USER';
  }, [session?.role]);
  // console.log("user Role :", userRole)

  useEffect(() => {
    const fetchOrder = async () => {
      const response = await api.get('/order/admin');
      console.log("Fetched orders for admin:", response.data);
    }
    fetchOrder();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let endpoint = '/order';
      
      // Adjust endpoint based on user role
      if (userRole === 'ROLE_ADMIN') {
        endpoint = '/order/admin';
      }
      
      const response = await api.get(endpoint);
      setOrders(response.data);
      localStorage.removeItem('dabbadelight_cart');
    } catch (error) {
      toast({ 
        title: 'Error fetching orders', 
        description: error.response?.data?.message || error.message, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
    toast({ title: 'Orders refreshed' });
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/order/${orderId}/status`, { status: newStatus });
      toast({ title: 'Order status updated successfully' });
      fetchOrders(); // Refresh orders
    } catch (error) {
      toast({ 
        title: 'Error updating order status', 
        description: error.response?.data?.message || error.message, 
        variant: 'destructive' 
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'CONFIRMED': 'bg-blue-100 text-blue-800 border-blue-300',
      'PREPARING': 'bg-orange-100 text-orange-800 border-orange-300',
      'OUT_FOR_DELIVERY': 'bg-purple-100 text-purple-800 border-purple-300',
      'DELIVERED': 'bg-green-100 text-green-800 border-green-300',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'PENDING': <Clock className="h-4 w-4" />,
      'CONFIRMED': <CheckCircle className="h-4 w-4" />,
      'PREPARING': <Package className="h-4 w-4" />,
      'OUT_FOR_DELIVERY': <Truck className="h-4 w-4" />,
      'DELIVERED': <CheckCircle className="h-4 w-4" />,
      'CANCELLED': <Clock className="h-4 w-4" />
    };
    return icons[status] || <Clock className="h-4 w-4" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {userRole === 'ROLE_ADMIN' ? 'Restaurant Orders' : userRole === 'ROLE_SUPERADMIN' ? 'All Orders' : 'My Orders'}
          </h1>
          <p className="text-gray-600">
            {userRole === 'ROLE_ADMIN' 
              ? 'Manage orders for your restaurant' 
              : userRole === 'ROLE_SUPERADMIN'
              ? 'View and manage all system orders'
              : 'Track your food orders'
            }
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No orders found</h2>
          <p className="text-gray-600">
            {userRole === 'USER' 
              ? "You haven't placed any orders yet" 
              : "No orders to display"
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.orderId} className="border-2 border-orange-100 hover:border-orange-300 transition-colors">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5 text-orange-600" />
                      Order #{order.orderId}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(order.orderStatus)} border`}>
                      {getStatusIcon(order.orderStatus)}
                      <span className="ml-1">{order.orderStatus}</span>
                    </Badge>
                    {userRole === 'ROLE_ADMIN' && order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
                      <Select
                        value={order.orderStatus}
                        onValueChange={(newStatus) => updateOrderStatus(order.orderId, newStatus)}
                      >
                        <SelectTrigger className="w-40 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">PENDING</SelectItem>
                          <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                          <SelectItem value="PREPARING">PREPARING</SelectItem>
                          <SelectItem value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</SelectItem>
                          <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                          <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
                  {/* Customer Info (for admin/superadmin) */}
                  {(userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPERADMIN') && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Customer
                      </h4>
                      <p className="text-sm text-gray-600">{order.userName}</p>
                    </div>
                  )}
                  
                  {/* Delivery Address */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Delivery Address
                    </h4>
                    <p className="text-sm text-gray-600">
                      {order.addressLine1}
                      {order.addressLine2 && `, ${order.addressLine2}`}
                      <br />
                      {order.city}, {order.pincode}
                    </p>
                  </div>
                  
                  {/* Payment Info */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      Payment
                    </h4>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Mode: {order.paymentMode}</p>
                      <Badge 
                        className={`text-xs ${order.paymentStatus === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Order Items</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="h-8 text-xs">Item</TableHead>
                          <TableHead className="h-8 text-xs">Qty</TableHead>
                          <TableHead className="h-8 text-xs text-right">Price</TableHead>
                          <TableHead className="h-8 text-xs text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item) => (
                          <TableRow key={item.itemId}>
                            <TableCell className="py-2 text-sm">{item.itemName}</TableCell>
                            <TableCell className="py-2 text-sm">{item.quantity}</TableCell>
                            <TableCell className="py-2 text-sm text-right">₹{item.price}</TableCell>
                            <TableCell className="py-2 text-sm text-right font-medium">
                              ₹{(item.quantity * item.price).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Order Total */}
                <div className="flex justify-end mt-4">
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-green-600">₹{order.totalAmount}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;