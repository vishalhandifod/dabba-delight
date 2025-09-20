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
  Drumstick,
  Filter,
  SortAsc,
  Heart,
  Users,
  Award,
  ChefHat,
  X
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ProductPage = () => {
  const [menus, setMenus] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchActiveMenus();
    loadCartFromStorage();
  }, []);

  useEffect(() => {
    if (menus.length > 0) {
      fetchAllItems();
    }
  }, [menus]);

  useEffect(() => {
    filterAndSortItems();
  }, [allItems, searchTerm, selectedFilter, sortBy, priceRange]);

  const fetchActiveMenus = async () => {
    setLoading(true);
    try {
      const response = await api.get('/menu/active');
      console.log(response.data);
            setMenus(response.data);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to fetch restaurants', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllItems = async () => {
    setItemsLoading(true);
    try {
      const itemPromises = menus.map(menu => 
        api.get(`/item/menu/${menu.id}/available`).then(response => 
          response.data.map(item => ({
            ...item,
            restaurantName: menu.name,
            restaurantRating: menu.rating,
            restaurantLocation: menu.kitchenAddresses?.[0]?.city || 'Multiple locations'
          }))
        )
      );
      
      const itemArrays = await Promise.all(itemPromises);
      console.log("item",itemArrays);
      const items = itemArrays.flat();
      setAllItems(items);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to fetch dishes', 
        variant: 'destructive' 
      });
    } finally {
      setItemsLoading(false);
    }
  };

  const filterAndSortItems = () => {
    let items = [...allItems];

    // Search filter
    if (searchTerm) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.restaurantName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'veg') {
        items = items.filter(item => item.isVeg);
      } else if (selectedFilter === 'non-veg') {
        items = items.filter(item => !item.isVeg);
      } else if (selectedFilter === 'in-stock') {
        items = items.filter(item => item.stock > 0);
      } else if (selectedFilter === 'low-stock') {
        items = items.filter(item => item.stock > 0 && item.stock < 10);
      }
    }

    // Price range filter
    if (priceRange !== 'all') {
      if (priceRange === 'under-100') {
        items = items.filter(item => item.price < 100);
      } else if (priceRange === '100-200') {
        items = items.filter(item => item.price >= 100 && item.price <= 200);
      } else if (priceRange === 'above-200') {
        items = items.filter(item => item.price > 200);
      }
    }

    // Sort items
    items.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.restaurantRating || 0) - (a.restaurantRating || 0);
        case 'restaurant':
          return a.restaurantName.localeCompare(b.restaurantName);
        default:
          return 0;
      }
    });

    setFilteredItems(items);
  };

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
      title: '✅ Added to cart', 
      description: `${item.name} from ${item.restaurantName}`,
      className: 'border-green-200 bg-green-50'
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
  };

  const loadCartFromStorage = () => {
    // Since localStorage is not available, cart starts empty
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
      stars.push(<Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-3 h-3 fill-yellow-400/50 text-yellow-400" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-3 h-3 text-gray-300" />);
    }
    
    return stars;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFilter('all');
    setSortBy('name');
    setPriceRange('all');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Enhanced Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-40 border-b border-orange-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    DabbaDelight
                  </h1>
                  <p className="text-gray-600 text-sm">Premium regional cuisines delivered</p>
                </div>
              </div>
            </div>
            
            {/* Header Stats */}
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{menus.length} Restaurants</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                <span>{filteredItems.length} Dishes</span>
              </div>
            </div>
            
            {/* Cart Button */}
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <Button className="relative bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cart
                  {getCartItemsCount() > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-green-500 text-white min-w-[20px] h-5 rounded-full flex items-center justify-center text-xs animate-pulse">
                      {getCartItemsCount()}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-96">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Your Order ({getCartItemsCount()} items)
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <ShoppingCart className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-lg font-medium mb-2">Your cart is empty</p>
                      <p className="text-sm">Add some delicious items to get started</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {cart.map((item) => (
                          <div key={item.id} className="flex gap-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="text-xs text-gray-600 mb-1">{item.restaurantName}</p>
                              <p className="text-sm font-semibold text-green-600">₹{item.price}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => removeFromCart(item.id)}
                                className="w-8 h-8 p-0 border-orange-200 hover:bg-orange-100"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => addToCart(item)}
                                className="w-8 h-8 p-0 border-orange-200 hover:bg-orange-100"
                                disabled={item.quantity >= item.stock}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t pt-4 mt-6 space-y-4">
                        <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-4">
                          <div className="flex justify-between text-lg font-bold text-gray-900">
                            <span>Total Amount:</span>
                            <span className="text-green-600">₹{getCartTotal().toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">Inclusive of all taxes</p>
                        </div>
                        <div className="space-y-2">
                          <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg" size="lg">
                            Proceed to Checkout
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full border-orange-200 hover:bg-orange-50" 
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
        {/* Enhanced Search and Filter Section */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-orange-100">
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search for dishes, restaurants, or cuisines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg border-orange-200 focus:border-orange-400 rounded-xl"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-40 border-orange-200">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="veg">🥬 Vegetarian</SelectItem>
                  <SelectItem value="non-veg">🍖 Non-Vegetarian</SelectItem>
                  <SelectItem value="in-stock">✅ In Stock</SelectItem>
                  <SelectItem value="low-stock">⚠️ Low Stock</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-40 border-orange-200">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-100">Under ₹100</SelectItem>
                  <SelectItem value="100-200">₹100 - ₹200</SelectItem>
                  <SelectItem value="above-200">Above ₹200</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <SortAsc className="w-4 h-4 text-gray-600" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 border-orange-200">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Restaurant Rating</SelectItem>
                    <SelectItem value="restaurant">Restaurant Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(searchTerm || selectedFilter !== 'all' || sortBy !== 'name' || priceRange !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="border-orange-200 hover:bg-orange-50"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredItems.length} of {allItems.length} dishes
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {loading || itemsLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="animate-pulse overflow-hidden">
                <CardContent className="p-0">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-orange-100 to-red-100 flex items-center justify-center">
              <Search className="w-16 h-16 text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No dishes found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? `No items match "${searchTerm}" with current filters`
                : "No items match your current filters"
              }
            </p>
            <Button onClick={clearFilters} className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="group hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white/90 backdrop-blur-sm border-orange-100 hover:border-orange-300 hover:-translate-y-1">
                <CardContent className="p-0">
                  {/* Item Image Placeholder with Gradient */}
                  <div className="h-48 bg-gradient-to-br from-orange-400 via-red-400 to-pink-400 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-3 left-3 flex gap-2">
                      {item.isVeg ? (
                        <Badge className="bg-green-500 text-white border-0">
                          <Leaf className="w-3 h-3 mr-1" />
                          Veg
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500 text-white border-0">
                          <Drumstick className="w-3 h-3 mr-1" />
                          Non-Veg
                        </Badge>
                      )}
                      {item.stock < 10 && item.stock > 0 && (
                        <Badge className="bg-orange-500 text-white border-0 animate-pulse">
                          Only {item.stock} left
                        </Badge>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <div className="flex items-center gap-1 text-white text-sm bg-black/50 px-2 py-1 rounded-full">
                        {renderStars(item.restaurantRating || 4.2)}
                        <span className="ml-1">{item.restaurantRating || 4.2}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    {/* Restaurant Info */}
                    <div className="mb-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span className="font-medium">{item.restaurantName}</span>
                        <span>•</span>
                        <span>{item.restaurantLocation}</span>
                      </div>
                    </div>

                    {/* Item Name */}
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                      {item.name}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10">
                      {item.details}
                    </p>

                    {/* Price and Add to Cart */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-green-600">
                          ₹{item.price}
                        </span>
                        <div className="text-xs text-gray-500">
                          Stock: {item.stock}
                        </div>
                      </div>
                    </div>

                    {/* Add to Cart Section */}
                    <div className="mt-4">
                      {getCartItemQuantity(item.id) > 0 ? (
                        <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-2 border border-orange-200">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 p-0 border-orange-300"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="font-bold text-lg px-4">
                            {getCartItemQuantity(item.id)}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addToCart(item)}
                            className="w-8 h-8 p-0 border-orange-300"
                            disabled={getCartItemQuantity(item.id) >= item.stock}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => addToCart(item)}
                          disabled={item.stock === 0}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg disabled:opacity-50"
                          size="sm"
                        >
                          {item.stock === 0 ? (
                            <>Out of Stock</>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Add to Cart
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Item Footer */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>30-45 min</span>
                        </div>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Button for Mobile */}
      {getCartItemsCount() > 0 && (
        <div className="fixed bottom-6 right-6 lg:hidden z-50">
          <Button
            onClick={() => setCartOpen(true)}
            className="rounded-full w-16 h-16 shadow-2xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white animate-pulse"
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              <Badge className="absolute -top-2 -right-2 bg-green-500 text-white min-w-[20px] h-5 rounded-full flex items-center justify-center text-xs">
                {getCartItemsCount()}
              </Badge>
            </div>
          </Button>
        </div>
      )}


    </div>
  );
};

export default ProductPage;