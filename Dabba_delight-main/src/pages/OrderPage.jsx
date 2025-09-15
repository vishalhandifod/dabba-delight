import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const OrderPage = () => {
  const [users, setUsers] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [items, setItems] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [paymentStatus, setPaymentStatus] = useState('PENDING');
  const [orderStatus, setOrderStatus] = useState('PENDING');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchMenus();
    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedMenu) {
      fetchItems(selectedMenu);
    }
  }, [selectedMenu]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/order');
      setOrders(response.data);
    } catch (error) {
      toast({ title: 'Error fetching orders', description: error.message, variant: 'destructive' });
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      toast({ title: 'Error fetching users', description: error.message, variant: 'destructive' });
    }
  };

  const fetchMenus = async () => {
    try {
      const response = await api.get('/menu');
      setMenus(response.data);
    } catch (error) {
      toast({ title: 'Error fetching menus', description: error.message, variant: 'destructive' });
    }
  };

  const fetchItems = async (menuId) => {
    try {
      const response = await api.get(`/item/menu/${menuId}`);
      setItems(response.data);
    } catch (error) {
      toast({ title: 'Error fetching items', description: error.message, variant: 'destructive' });
    }
  };

  // const addToOrder = (item) => {
  //   setOrderItems([...orderItems, { ...item, quantity: 1 }]);
  // };

  // const createOrder = async () => {
  //   try {
  //     const orderPayload = {
  //       user: {id: selectedUser},
  //       paymentMode,
  //       paymentStatus,
  //       orderStatus,
  //       orderItems: orderItems.map(item => ({
  //         item: { id: item.id },
  //         quantity: item.quantity,
  //         priceAtPurchase: item.price
  //       }))
  //     };
  //     await api.post('/order', orderPayload);
  //     toast({ title: 'Order created' });
  //     fetchOrders();
  //   } catch (error) {
  //     toast({ title: 'Error creating order', description: error.message, variant: 'destructive' });
  //   }
  // };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Order</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Select onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedMenu}>
              <SelectTrigger>
                <SelectValue placeholder="Select a menu" />
              </SelectTrigger>
              <SelectContent>
                {menus.map((menu) => (
                  <SelectItem key={menu.id} value={menu.id}>
                    {menu.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card> */}

      {selectedMenu && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">${item.price}</p>
                <Button onClick={() => addToOrder(item)}>Add to Order</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {orderItems.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {orderItems.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>{item.quantity}</span>
                </li>
              ))}
            </ul>
            <div className="grid gap-4 md:grid-cols-3 mt-4">
              <Select onValueChange={setPaymentMode} defaultValue={paymentMode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Payment Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">CASH</SelectItem>
                  <SelectItem value="ONLINE">ONLINE</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={setPaymentStatus} defaultValue={paymentStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={setOrderStatus} defaultValue={orderStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Order Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                  <SelectItem value="PREPARING">PREPARING</SelectItem>
                  <SelectItem value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</SelectItem>
                  <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={createOrder} className="mt-4">Place Order</Button>
          </CardContent>
        </Card>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchOrders} className="mb-4">Refresh Orders</Button>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Order Items</TableHead>
                <TableHead>Total Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell>{order.orderId}</TableCell>
                  <TableCell>{order.userName}</TableCell>
                  <TableCell>{`${order.addressLine1}, ${order.addressLine2}, ${order.city}, ${order.pincode}`}</TableCell>
                  <TableCell>{order.paymentMode}</TableCell>
                  <TableCell>{order.paymentStatus}</TableCell>
                  <TableCell>{order.orderStatus}</TableCell>
                  <TableCell>
                    <ul>
                      {order.items.map(item => (
                        <li key={item.itemId}>{item.itemName} (x{item.quantity})</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>{order.totalAmount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderPage;
