import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';


const ItemPage = () => {
  const { menuId } = useParams();
  const { toast } = useToast();

  const [items, setItems] = useState([]);
  const [cartItems, setCartItems] = useState([]); // local cart
  const [cartOpen, setCartOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  const token = localStorage.getItem('dabba_delight_token');
  const userEmail = token ? jwtDecode(token).sub : null;

  useEffect(() => {
    fetchItems();
    if (userEmail) {
      api.get(`/users/by-email?email=${userEmail}`)
        .then(response => {
          setUserId(response.data.id);
        })
        .catch(error => {
          console.error('Error fetching user ID:', error);
        });
    }
  }, [menuId, userEmail]);

  const fetchItems = async () => {
    try {
      const response = await api.get(`/item/menu/${menuId}`);
      setItems(response.data);
    } catch (error) {
      toast({ title: 'Error fetching items', description: error.message, variant: 'destructive' });
    }
  };

  // --- Cart Handlers ---
  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(ci => ci.id === item.id);
      if (existing) {
        return prev.map(ci =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
    setCartOpen(true); // ✅ open cart when something is added
  };


  const updateQuantity = (itemId, delta) => {
    setCartItems((prev) => {
      return prev
        .map(ci => ci.id === itemId ? { ...ci, quantity: ci.quantity + delta } : ci)
        .filter(ci => ci.quantity > 0); // remove if zero
    });
  };

  const getItemQuantity = (itemId) => {
    const item = cartItems.find(ci => ci.id === itemId);
    return item ? item.quantity : 0;
  };

  const totalAmount = cartItems.reduce((sum, ci) => sum + ci.price * ci.quantity, 0);

  const confirmOrder = async (items) => {
    try {
      const orderPayload = {
        userId: userId, // ✅ backend will map this correctly
        paymentMode: "CASH",
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        orderItems: items.map(ci => ({
          itemId: ci.id,   // ✅ flatten as well
          quantity: ci.quantity,
          priceAtPurchase: ci.price
        }))
      };
      
      await api.post('/order', orderPayload);
      toast({ title: "Order placed successfully!" });
      setCartItems([]);
      setCartOpen(false);
    } catch (err) {
      toast({ title: "Error placing order", description: err.message, variant: "destructive" });
    }
  };


  return (
    <div className="container mx-auto py-8 px-4">
      {/* Items Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const quantity = getItemQuantity(item.id);
          return (
            <Card key={item.id} className="flex flex-col">
              <CardHeader className="p-0">
                <img src={`https://images.unsplash.com/photo-1694388001616-1176f534d72f`} alt={item.name} className="w-full h-48 object-cover rounded-t-lg" />
              </CardHeader>
              <CardContent className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <CardTitle className="text-xl font-bold mb-2">{item.name}</CardTitle>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.details}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <p className="text-lg font-semibold text-orange-600">₹{item.price}</p>
                  {quantity === 0 ? (
                    <Button onClick={() => addToCart(item)} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center space-x-2">
                      <ShoppingCart className="h-5 w-5" />
                      <span>Add</span>
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Button onClick={() => updateQuantity(item.id, -1)} size="icon" variant="outline" className="h-8 w-8">
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-semibold text-lg">{quantity}</span>
                      <Button onClick={() => updateQuantity(item.id, +1)} size="icon" variant="outline" className="h-8 w-8">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cart Sidebar */}
      {cartOpen ? (
        <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg z-50 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-bold text-lg">Your Cart</h2>
            <button 
              className="text-gray-500 hover:text-black" 
              onClick={() => setCartOpen(false)}
            >
              ⬇ Minimize
            </button>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <p className="text-gray-500">Cart is empty</p>
            ) : (
              cartItems.map(ci => (
                <div key={ci.id} className="flex justify-between items-center border-b py-2">
                  <div>
                    <p className="font-medium">{ci.name}</p>
                    <p className="text-sm text-gray-500">₹{ci.price} x {ci.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="icon" 
                      onClick={() =>
                        setCartItems(prev =>
                          prev.map(x =>
                            x.id === ci.id && x.quantity > 1
                              ? { ...x, quantity: x.quantity - 1 }
                              : x
                          ).filter(x => x.quantity > 0)
                        )
                      }
                    >-</Button>
                    <span>{ci.quantity}</span>
                    <Button 
                      size="icon" 
                      onClick={() =>
                        setCartItems(prev =>
                          prev.map(x =>
                            x.id === ci.id
                              ? { ...x, quantity: x.quantity + 1 }
                              : x
                          )
                        )
                      }
                    >+</Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <p className="font-bold mb-2">
              Total: ₹{cartItems.reduce((acc, ci) => acc + ci.price * ci.quantity, 0)}
            </p>
            <Button className="w-full" onClick={() => confirmOrder(cartItems)}>
              Confirm Order
            </Button>
          </div>
        </div>
      ) : (
        // Floating button when minimized
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-4 right-4 bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-orange-600"
        >
          🛒 View Cart ({cartItems.length})
        </button>
      )}


    </div>
  );
};

export default ItemPage;