import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Search, 
  Star, 
  MapPin, 
  Clock, 
  Plus, 
  Minus, 
  ShoppingCart,
  Leaf,
  Drumstick
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const ProductPage = () => {
  const [menus, setMenus] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchActiveMenus();
    loadCartFromStorage();
  }, []);

  useEffect(() => {
    if (selectedMenuId) {
      fetchAvailableItems(selectedMenuId);
    }
  }, [selectedMenuId]);

  const fetchActiveMenus = async () => {
    setLoading(true);
    try {
      const response = await api.get('/menu/active');
      setMenus(response.data);
      if (response.data.length > 0 && !selectedMenuId) {
        setSelectedMenuId(response.data[0].id);
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to fetch menus', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableItems = async (menuId) => {
    setItemsLoading(true);
    try {
      const response = await api.get(`/item/menu/${menuId}/available`);
      setItems(response.data);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to fetch items', 
        variant: 'destructive' 
      });
    } finally {
      setItemsLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    let newCart;
    
    if (existingItem) {
      if (existingItem.quantity >= item.stock) {
        toast({ 
          title: 'Stock limit reached', 
          description: `Only ${item.stock} items available`, 
          variant: 'destructive' 
        });
        return;
      }
      newCart = cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
    } else {
      if (item.stock === 0) {
        toast({ 
          title: 'Out of stock', 
          description: 'This item is currently out of stock', 
          variant: 'destructive' 
        });
        return;
      }
      newCart = [...cart, { ...item, quantity: 1 }];
    }
    
    setCart(newCart);
    saveCartToStorage(newCart);
    toast({ 
      title: 'Added to cart', 
      description: `${item.name} added to cart` 
    });
  };

  const removeFromCart = (itemId) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    let newCart;
    
    if (existingItem && existingItem.quantity > 1) {
      newCart = cart.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      );
    } else {
      newCart = cart.filter(cartItem => cartItem.id !== itemId);
    }
    
    setCart(newCart);
    saveCartToStorage(newCart);
  };

  const getCartItemQuantity = (itemId) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const saveCartToStorage = (cartData) => {
    // Since localStorage is not available, we'll keep cart in memory
    // In a real app, you'd save to localStorage or send to backend
  };

  const loadCartFromStorage = () => {
    // Since localStorage is not available, cart starts empty
    // In a real app, you'd load from localStorage or backend
  };

  const clearCart = () => {
    setCart([]);
    saveCartToStorage([]);
    toast({ title: 'Cart cleared' });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DabbaDelight</h1>
              <p className="text-gray-600">Delicious regional meals delivered</p>
            </div>
            
            {/* Cart Button */}
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <Button className="relative">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cart
                  {getCartItemsCount() > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white min-w-[20px] h-5 rounded-full flex items-center justify-center text-xs">
                      {getCartItemsCount()}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-96">
                <SheetHeader>
                  <SheetTitle>Your Cart</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Your cart is empty</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-gray-600">₹{item.price}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => removeFromCart(item.id)}
                                className="w-8 h-8 p-0"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => addToCart(item)}
                                className="w-8 h-8 p-0"
                                disabled={item.quantity >= item.stock}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t pt-4 mt-6">
                        <div className="flex justify-between text-lg font-semibold mb-4">
                          <span>Total:</span>
                          <span>₹{getCartTotal().toFixed(2)}</span>
                        </div>
                        <div className="space-y-2">
                          <Button className="w-full" size="lg">
                            Proceed to Checkout
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={clearCart}
                          >
                            Clear Cart
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Menu Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Available Menus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-4">Loading menus...</div>
                  ) : menus.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No menus available</div>
                  ) : (
                    menus.map((menu) => (
                      <div
                        key={menu.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedMenuId === menu.id
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedMenuId(menu.id)}
                      >
                        <h3 className="font-semibold text-lg mb-2">{menu.name}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {menu.details}
                        </p>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center">
                            {renderStars(menu.rating)}
                          </div>
                          <span className="text-sm text-gray-600">
                            {menu.rating}/5
                          </span>
                        </div>

                        {/* Kitchen Addresses */}
                        {menu.kitchenAddresses && menu.kitchenAddresses.length > 0 && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span>{menu.kitchenAddresses[0].city}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items Display */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search for dishes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Selected Menu Info */}
            {selectedMenuId && (
              <div className="mb-6">
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                  <CardContent className="pt-6">
                    {(() => {
                      const selectedMenu = menus.find(m => m.id === selectedMenuId);
                      return selectedMenu ? (
                        <div>
                          <h2 className="text-2xl font-bold mb-2">{selectedMenu.name}</h2>
                          <p className="text-gray-700 mb-3">{selectedMenu.details}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {renderStars(selectedMenu.rating)}
                              <span className="text-sm text-gray-600">
                                {selectedMenu.rating}/5 Rating
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>30-45 min</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>Multiple locations</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Items Grid */}
            {!selectedMenuId ? (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Choose a Menu</h3>
                <p>Select a menu from the sidebar to browse delicious items</p>
              </div>
            ) : itemsLoading ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="pt-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No Items Found</h3>
                <p>
                  {searchTerm 
                    ? `No items match "${searchTerm}"`
                    : "No items available in this menu"
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                    <CardContent className="pt-6">
                      {/* Item Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            {item.isVeg ? (
                              <Leaf className="w-5 h-5 text-green-500" />
                            ) : (
                              <Drumstick className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {item.details}
                          </p>
                        </div>
                      </div>

                      {/* Price and Stock */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-green-600">
                            ₹{item.price}
                          </span>
                          {item.stock < 10 && item.stock > 0 && (
                            <Badge variant="outline" className="text-orange-600 border-orange-300">
                              Only {item.stock} left
                            </Badge>
                          )}
                        </div>
                        <Badge 
                          variant={item.isVeg ? "outline" : "secondary"}
                          className={item.isVeg ? "text-green-700 border-green-300" : "text-red-700 border-red-300"}
                        >
                          {item.isVeg ? "Vegetarian" : "Non-Vegetarian"}
                        </Badge>
                      </div>

                      {/* Add to Cart Section */}
                      <div className="flex items-center justify-between">
                        {getCartItemQuantity(item.id) > 0 ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(item.id)}
                              className="w-8 h-8 p-0"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {getCartItemQuantity(item.id)}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addToCart(item)}
                              className="w-8 h-8 p-0"
                              disabled={getCartItemQuantity(item.id) >= item.stock}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => addToCart(item)}
                            disabled={item.stock === 0}
                            className="flex items-center gap-2"
                            size="sm"
                          >
                            <Plus className="w-4 h-4" />
                            {item.stock === 0 ? "Out of Stock" : "Add to Cart"}
                          </Button>
                        )}
                        
                        <div className="text-sm text-gray-500">
                          Stock: {item.stock}
                        </div>
                      </div>

                      {/* Item Footer */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Added by: {item.createdBy}</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Cart Button for Mobile */}
      {getCartItemsCount() > 0 && (
        <div className="fixed bottom-6 right-6 lg:hidden">
          <Button
            onClick={() => setCartOpen(true)}
            className="rounded-full w-14 h-14 shadow-lg"
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white min-w-[20px] h-5 rounded-full flex items-center justify-center text-xs">
                {getCartItemsCount()}
              </Badge>
            </div>
          </Button>
        </div>
      )}

      {/* Admin Link for Testing */}
      <div className="fixed bottom-6 left-6">
        <Link to="/admin/menu-management">
          <Button variant="outline" size="sm">
            Admin Panel
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ProductPage;