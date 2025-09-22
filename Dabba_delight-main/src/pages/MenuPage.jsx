import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddMenu from '@/components/AddMenu';
import AddItem from '@/components/AddItem';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Star,
  MapPin,
  ChefHat,
  Store,
  Utensils,
  Clock,
  Package,
  TrendingUp,
  Settings,
  Home,
  Leaf,
  Drumstick,
  DollarSign,
  BarChart3,
  Users,
  Award,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const MenuPage = () => {
  const [menus, setMenus] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adminHotel, setAdminHotel] = useState(null);
  const [showCreateMenuDialog, setShowCreateMenuDialog] = useState(false);
  const [showCreateItemDialog, setShowCreateItemDialog] = useState(false);
  const [showEditMenuDialog, setShowEditMenuDialog] = useState(false);
  const [showEditItemDialog, setShowEditItemDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: null, id: null, name: null });
  
  const [newMenu, setNewMenu] = useState({
    name: '',
    details: '',
    rating: 0,
    isActive: true
  });

  const [editingMenu, setEditingMenu] = useState({
    id: null,
    name: '',
    details: '',
    rating: 0,
    isActive: true
  });

  const [newItem, setNewItem] = useState({
    name: '',
    details: '',
    price: 0,
    stock: 0,
    isVeg: true,
    isAvailable: true
  });

  const [editingItem, setEditingItem] = useState({
    id: null,
    name: '',
    details: '',
    price: 0,
    stock: 0,
    isVeg: true,
    isAvailable: true
  });

  const { toast } = useToast();
  const { session } = useAuth();
  const authUserName = session.email;

  useEffect(() => {
    fetchMenus();
  }, []);

  useEffect(() => {
    if (selectedMenuId) {
      fetchItems(selectedMenuId);
    }
  }, [selectedMenuId]);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const response = await api.get('/menu?includeInactive=true');
      const userMenus = response.data.filter(menu => menu.createdBy === authUserName);
      setMenus(userMenus);

      const adminCreatedHotel = userMenus.length > 0 ? userMenus[0] : null;
      setAdminHotel(adminCreatedHotel);
      // console.log("Admin Created Hotel:", adminHotel);

      if (adminCreatedHotel) {
        setSelectedMenuId(adminCreatedHotel.id);
      } else {
        setSelectedMenuId(null);
      }
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

  const canAddHotel = !adminHotel;

  const handleAddHotelAttempt = () => {
    if (canAddHotel) {
      setShowCreateMenuDialog(true);
    } else {
      toast({
        title: 'Restaurant Limit Reached',
        description: 'You can only manage one restaurant at a time. Edit or delete your current restaurant to add a new one.',
        variant: 'default',
      });
    }
  };

  const fetchItems = async (menuId) => {
    if (!menuId) {
      setItems([]);
      return;
    }
    try {
      const response = await api.get(`/item/menu/${menuId}`);
      setItems(response.data);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to fetch menu items', 
        variant: 'destructive' 
      });
    }
  };

  const updateMenu = async () => {
    try {
      await api.put(`/menu/${editingMenu.id}`, editingMenu);
      setShowEditMenuDialog(false);
      fetchMenus();
      toast({ 
        title: 'Success', 
        description: 'Restaurant updated successfully',
        className: 'border-green-200 bg-green-50'
      });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || 'Failed to update restaurant',
        variant: 'destructive' 
      });
    }
  };
console.log("items:", items);
  const toggleMenuStatus = async (menuId) => {
    try {
      await api.patch(`/menu/${menuId}/toggle-status`);
      fetchMenus();
      toast({ 
        title: 'Success', 
        description: 'Restaurant status updated',
        className: 'border-green-200 bg-green-50'
      });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to update restaurant status', 
        variant: 'destructive' 
      });
    }
  };

  const deleteMenu = async (menuId) => {
    try {
      await api.delete(`/menu/${menuId}`);
      fetchMenus();
      if (selectedMenuId === menuId) {
        setSelectedMenuId(menus.length > 1 ? menus.find(m => m.id !== menuId)?.id : null);
      }
      toast({ 
        title: 'Success', 
        description: 'Restaurant deleted successfully',
        className: 'border-green-200 bg-green-50'
      });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to delete restaurant', 
        variant: 'destructive' 
      });
    }
  };

  const updateItem = async () => {
    try {
      await api.put(`/item/${editingItem.id}`, editingItem);
      setShowEditItemDialog(false);
      fetchItems(selectedMenuId);
      toast({ 
        title: 'Success', 
        description: 'Menu item updated successfully',
        className: 'border-green-200 bg-green-50'
      });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || 'Failed to update item',
        variant: 'destructive' 
      });
    }
  };

  const toggleItemAvailability = async (itemId) => {
    try {
      await api.patch(`/item/${itemId}/toggle-availability`);
      fetchItems(selectedMenuId);
      toast({ 
        title: 'Success', 
        description: 'Item availability updated',
        className: 'border-green-200 bg-green-50'
      });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to update item availability', 
        variant: 'destructive' 
      });
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await api.delete(`/item/${itemId}`);
      fetchItems(selectedMenuId);
      toast({ 
        title: 'Success', 
        description: 'Menu item deleted successfully',
        className: 'border-green-200 bg-green-50'
      });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to delete item', 
        variant: 'destructive' 
      });
    }
  };

  const handleDelete = () => {
    if (deleteTarget.type === 'menu') {
      deleteMenu(deleteTarget.id);
    } else if (deleteTarget.type === 'item') {
      deleteItem(deleteTarget.id);
    }
    setDeleteDialogOpen(false);
    setDeleteTarget({ type: null, id: null, name: null });
  };

  const openEditMenuDialog = (menu) => {
    setEditingMenu({
      id: menu.id,
      name: menu.name,
      details: menu.details,
      rating: menu.rating,
      isActive: menu.isActive
    });
    setShowEditMenuDialog(true);
  };

  const openEditItemDialog = (item) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      details: item.details,
      price: item.price,
      stock: item.stock,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable
    });
    setShowEditItemDialog(true);
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

  const getStats = () => {
    const totalItems = items.length;
    const availableItems = items.filter(item => item.isAvailable).length;
    const vegItems = items.filter(item => item.isVeg).length;
    const avgPrice = items.length > 0 ? (items.reduce((sum, item) => sum + item.price, 0) / items.length).toFixed(2) : 0;
    
    return { totalItems, availableItems, vegItems, avgPrice };
  };

  const stats = getStats();

  return (
    <div className=" bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-40 border-b border-blue-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Restaurant Dashboard
                  </h1>
                  <p className="text-gray-600 text-sm">Manage your restaurant and menu items</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {adminHotel && (
                <div className="text-right">
                  <p className="font-medium text-gray-900">{adminHotel.name}</p>
                  <p className="text-sm text-gray-600">Your Restaurant</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Stats Dashboard */}
        {adminHotel && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Items</p>
                    <p className="text-2xl font-bold">{stats.totalItems}</p>
                  </div>
                  <Package className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Available</p>
                    <p className="text-2xl font-bold">{stats.availableItems}</p>
                  </div>
                  <Eye className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">Vegetarian</p>
                    <p className="text-2xl font-bold">{stats.vegItems}</p>
                  </div>
                  <Leaf className="w-8 h-8 text-emerald-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Avg Price</p>
                    <p className="text-2xl font-bold">₹{stats.avgPrice}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Restaurant Management Section */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Store className="w-6 h-6 text-blue-600" />
                    <CardTitle className="text-blue-900">Your Restaurant</CardTitle>
                  </div>
                  {/* {canAddHotel && (
                    <Button
                      size="sm"
                      onClick={() => setShowCreateMenuDialog(true)}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Restaurant
                    </Button>
                  )} */}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {adminHotel ? (
                  <div className="space-y-6">
                    {/* Restaurant Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{adminHotel.name}</h3>
                          <p className="text-gray-600 mb-3 line-clamp-2">{adminHotel.details}</p>
                          
                          {/* Rating */}
                          {/* <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center">
                              {renderStars(adminHotel.rating)}
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {adminHotel.rating}/5
                            </span>
                          </div> */}

                          {/* Status */}
                          <div className="flex items-center gap-2 mb-4">
                            <Badge 
                              variant={adminHotel.active ? "default" : "secondary"}
                              className={adminHotel.active ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300"}
                            >
                              {adminHotel.active ? (
                                <>
                                  <Eye className="w-3 h-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3 mr-1" />
                                  Inactive
                                </>
                              )}
                            </Badge>
                          </div>

                          {/* Creator Info */}
                          <div className="text-xs text-gray-500 mb-4">
                            Created by: {adminHotel.createdBy}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => openEditMenuDialog(adminHotel)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                          size="sm"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => toggleMenuStatus(adminHotel.id)}
                          variant="outline"
                          className="flex-1 border-blue-200 hover:bg-blue-50"
                          size="sm"
                        >
                          {adminHotel.active ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              Activate
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            setDeleteTarget({ type: 'menu', id: adminHotel.id, name: adminHotel.name });
                            setDeleteDialogOpen(true);
                          }}
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    {/* <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          size="sm"
                          onClick={() => document.getElementById('add-item-trigger')?.click()}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add New Item
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          size="sm"
                          onClick={() => toggleMenuStatus(adminHotel.id)}
                        >
                          {adminHotel.isActive ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                          {adminHotel.isActive ? 'Deactivate Restaurant' : 'Activate Restaurant'}
                        </Button>
                      </div>
                    </div> */}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                      <Store className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Restaurant Yet</h3>
                    <p className="text-gray-600 mb-4">Create your restaurant to start managing menu items</p>
                    <Button
                      onClick={handleAddHotelAttempt}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Restaurant
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Menu Items Management Section */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Utensils className="w-6 h-6 text-orange-600" />
                    <div>
                      <CardTitle className="text-orange-900">Menu Items</CardTitle>
                      {selectedMenuId && adminHotel && (
                        <p className="text-sm text-orange-700 mt-1">
                          Managing items for {adminHotel.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div id="add-item-trigger">
                    <AddItem 
                      menuId={selectedMenuId} 
                      onItemCreated={() => fetchItems(selectedMenuId)}
                      disabled={!selectedMenuId}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {!selectedMenuId ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-orange-100 to-red-100 flex items-center justify-center">
                      <Utensils className="w-12 h-12 text-orange-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Restaurant</h3>
                    <p className="text-gray-600">Create or select a restaurant to manage menu items</p>
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-orange-100 to-red-100 flex items-center justify-center">
                      <Package className="w-12 h-12 text-orange-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Menu Items</h3>
                    <p className="text-gray-600 mb-4">Start building your menu by adding your first item</p>
                    {/* <Button
                      onClick={() => document.getElementById('add-item-trigger')?.click()}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Item
                    </Button> */}
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {items.map((item) => (
                      <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 border-orange-100 hover:border-orange-300 bg-gradient-to-br from-white to-orange-50/30">
                        <CardContent className="p-6">
                          {/* Item Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-lg text-gray-900 truncate">{item.name}</h3>
                                {item.veg ? (
                                  <Leaf className="w-5 h-5 text-green-500 flex-shrink-0" />
                                ) : (
                                  <Drumstick className="w-5 h-5 text-red-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {item.details}
                              </p>
                            </div>
                          </div>

                          {/* Badges */}
                          <div className="flex items-center gap-2 mb-4">
                            {/* <Badge 
                              variant={item.veg ? "outline" : "secondary"}
                              className={item.veg ? "text-green-700 border-green-300 bg-green-50" : "text-red-700 border-red-300 bg-red-50"}
                            >
                              {item.veg ? "Vegetarian" : "Non-Vegetarian"}
                            </Badge> */}
                            <Badge 
                              variant={item.available ? "default" : "destructive"}
                              className={item.available ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300"}
                            >
                              {item.available ? "Available" : "Unavailable"}
                            </Badge>
                            {/* {item.stock < 10 && item.stock > 0 && (
                              <Badge variant="outline" className="text-orange-700 border-orange-300 bg-orange-50 animate-pulse">
                                Low Stock
                              </Badge>
                            )} */}
                          </div>

                          {/* Price and Stock */}
                          <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg mb-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="text-xl font-bold text-green-700">₹{item.price}</span>
                              </div>
                              {/* <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Package className="w-4 h-4" />
                                <span>Stock: {item.stock}</span>
                              </div> */}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => openEditItemDialog(item)}
                                className="bg-blue-500 hover:bg-blue-600 text-white"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setDeleteTarget({ type: 'item', id: item.id, name: item.name });
                                  setDeleteDialogOpen(true);
                                }}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            {/* Created By */}
                            {/* <div className="text-xs text-gray-500">
                              Added by: {item.createdBy}
                            </div> */}
                          </div>

                          {/* Item Footer with timestamp */}
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Added {new Date(item.createdAt).toLocaleDateString()}</span>
                              </div>
                              {item.stock === 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  Out of Stock
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Menu Dialog */}
        <AddMenu
          isOpen={showCreateMenuDialog}
          onOpenChange={setShowCreateMenuDialog}
          onMenuCreated={fetchMenus}
        />

        {/* Edit Restaurant Dialog */}
        <Dialog open={showEditMenuDialog} onOpenChange={setShowEditMenuDialog}>
          <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border-blue-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-blue-900">
                <Edit className="w-5 h-5" />
                Edit Restaurant
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-menu-name" className="text-sm font-medium text-gray-700">
                  Restaurant Name
                </Label>
                <Input
                  id="edit-menu-name"
                  value={editingMenu.name}
                  onChange={(e) => setEditingMenu({...editingMenu, name: e.target.value})}
                  className="border-blue-200 focus:border-blue-400"
                  placeholder="Enter restaurant name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-menu-details" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="edit-menu-details"
                  value={editingMenu.details}
                  onChange={(e) => setEditingMenu({...editingMenu, details: e.target.value})}
                  rows={3}
                  className="border-blue-200 focus:border-blue-400"
                  placeholder="Describe your restaurant..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-menu-rating" className="text-sm font-medium text-gray-700">
                  Rating (0-5)
                </Label>
                <Input
                  id="edit-menu-rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={editingMenu.rating}
                  onChange={(e) => setEditingMenu({...editingMenu, rating: parseFloat(e.target.value) || 0})}
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Switch
                  id="edit-menu-active"
                  checked={editingMenu.isActive}
                  onCheckedChange={(checked) => setEditingMenu({...editingMenu, isActive: checked})}
                />
                <Label htmlFor="edit-menu-active" className="text-sm font-medium text-gray-700">
                  Restaurant is active and accepting orders
                </Label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditMenuDialog(false)}
                  className="border-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={updateMenu}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Update Restaurant
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Item Dialog */}
        <Dialog open={showEditItemDialog} onOpenChange={setShowEditItemDialog}>
          <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border-orange-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-900">
                <Utensils className="w-5 h-5" />
                Edit Menu Item
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-item-name" className="text-sm font-medium text-gray-700">
                  Item Name
                </Label>
                <Input
                  id="edit-item-name"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  className="border-orange-200 focus:border-orange-400"
                  placeholder="Enter item name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-item-details" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="edit-item-details"
                  value={editingItem.details}
                  onChange={(e) => setEditingItem({...editingItem, details: e.target.value})}
                  rows={3}
                  className="border-orange-200 focus:border-orange-400"
                  placeholder="Describe the item..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-item-price" className="text-sm font-medium text-gray-700">
                    Price (₹)
                  </Label>
                  <Input
                    id="edit-item-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value) || 0})}
                    className="border-orange-200 focus:border-orange-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-item-stock" className="text-sm font-medium text-gray-700">
                    Stock Quantity
                  </Label>
                  <Input
                    id="edit-item-stock"
                    type="number"
                    min="0"
                    value={editingItem.stock}
                    onChange={(e) => setEditingItem({...editingItem, stock: parseInt(e.target.value) || 0})}
                    className="border-orange-200 focus:border-orange-400"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <Switch
                    id="edit-item-veg"
                    checked={editingItem.isVeg}
                    onCheckedChange={(checked) => setEditingItem({...editingItem, isVeg: checked})}
                  />
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-green-600" />
                    <Label htmlFor="edit-item-veg" className="text-sm font-medium text-gray-700">
                      Vegetarian item
                    </Label>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Switch
                    id="edit-item-available"
                    checked={editingItem.isAvailable}
                    onCheckedChange={(checked) => setEditingItem({...editingItem, isAvailable: checked})}
                  />
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <Label htmlFor="edit-item-available" className="text-sm font-medium text-gray-700">
                      Available for ordering
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditItemDialog(false)}
                  className="border-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={updateItem}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  <Utensils className="w-4 h-4 mr-2" />
                  Update Item
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enhanced Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-red-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-900">
                <Trash2 className="w-5 h-5" />
                Confirm Deletion
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-700">
                <div className="space-y-3">
                  <p>
                    You are about to permanently delete the {deleteTarget.type === 'menu' ? 'restaurant' : 'menu item'} 
                    <strong className="text-red-700"> "{deleteTarget.name}"</strong>.
                  </p>
                  {deleteTarget.type === 'menu' && (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-red-800 text-sm font-medium">
                        ⚠️ Warning: This will also permanently delete all menu items in this restaurant.
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-gray-600">
                    This action cannot be undone. Are you sure you want to continue?
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="border-gray-300">
                Keep {deleteTarget.type === 'menu' ? 'Restaurant' : 'Item'}
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default MenuPage;