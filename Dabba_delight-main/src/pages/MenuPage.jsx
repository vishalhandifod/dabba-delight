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
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
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

  const fetchItems = async (menuId) => {
    try {
      const response = await api.get(`/item/menu/${menuId}`);
      setItems(response.data);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to fetch items', 
        variant: 'destructive' 
      });
    }
  };

  const createMenu = async () => {
    try {
      await api.post('/menu', newMenu);
      setNewMenu({ name: '', details: '', rating: 0, isActive: true });
      setShowCreateMenuDialog(false);
      fetchMenus();
      toast({ title: 'Success', description: 'Menu created successfully' });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || 'Failed to create menu',
        variant: 'destructive' 
      });
    }
  };

  const updateMenu = async () => {
    try {
      await api.put(`/menu/${editingMenu.id}`, editingMenu);
      setShowEditMenuDialog(false);
      fetchMenus();
      toast({ title: 'Success', description: 'Menu updated successfully' });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || 'Failed to update menu',
        variant: 'destructive' 
      });
    }
  };

  const toggleMenuStatus = async (menuId) => {
    try {
      await api.patch(`/menu/${menuId}/toggle-status`);
      fetchMenus();
      toast({ title: 'Success', description: 'Menu status updated' });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to update menu status', 
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
      toast({ title: 'Success', description: 'Menu deleted successfully' });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to delete menu', 
        variant: 'destructive' 
      });
    }
  };

  const createItem = async () => {
    if (!selectedMenuId) {
      toast({ 
        title: 'Error', 
        description: 'Please select a menu first', 
        variant: 'destructive' 
      });
      return;
    }

    try {
      await api.post(`/item/menu/${selectedMenuId}`, newItem);
      setNewItem({ name: '', details: '', price: 0, stock: 0, isVeg: true, isAvailable: true });
      setShowCreateItemDialog(false);
      fetchItems(selectedMenuId);
      toast({ title: 'Success', description: 'Item created successfully' });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || 'Failed to create item',
        variant: 'destructive' 
      });
    }
  };

  const updateItem = async () => {
    try {
      await api.put(`/item/${editingItem.id}`, editingItem);
      setShowEditItemDialog(false);
      fetchItems(selectedMenuId);
      toast({ title: 'Success', description: 'Item updated successfully' });
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
      toast({ title: 'Success', description: 'Item availability updated' });
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
      toast({ title: 'Success', description: 'Item deleted successfully' });
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

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Menu & Item Management</h1>
        <p className="text-gray-600 mt-2">Manage your restaurant menus and items</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Management Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Menus</CardTitle>
              <Dialog open={showCreateMenuDialog} onOpenChange={setShowCreateMenuDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Menu
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Menu</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="menu-name">Menu Name</Label>
                      <Input
                        id="menu-name"
                        placeholder="Enter menu name"
                        value={newMenu.name}
                        onChange={(e) => setNewMenu({...newMenu, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="menu-details">Details</Label>
                      <Textarea
                        id="menu-details"
                        placeholder="Enter menu details"
                        value={newMenu.details}
                        onChange={(e) => setNewMenu({...newMenu, details: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="menu-rating">Rating</Label>
                      <Input
                        id="menu-rating"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={newMenu.rating}
                        onChange={(e) => setNewMenu({...newMenu, rating: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="menu-active"
                        checked={newMenu.isActive}
                        onCheckedChange={(checked) => setNewMenu({...newMenu, isActive: checked})}
                      />
                      <Label htmlFor="menu-active">Active</Label>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setShowCreateMenuDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createMenu} disabled={!newMenu.name.trim()}>
                        Create Menu
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4">Loading menus...</div>
                ) : menus.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No menus found</div>
                ) : (
                  menus.map((menu) => (
                    <div 
                      key={menu.id} 
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedMenuId === menu.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedMenuId(menu.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{menu.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {menu.details}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={menu.isActive ? "default" : "secondary"}>
                              {menu.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Rating: {menu.rating}/5
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Created by: {menu.createdBy}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMenuStatus(menu.id);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            {menu.isActive ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditMenuDialog(menu);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget({ type: 'menu', id: menu.id, name: menu.name });
                              setDeleteDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Item Management Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Items</CardTitle>
                {selectedMenuId && (
                  <p className="text-sm text-gray-600 mt-1">
                    Menu: {menus.find(m => m.id === selectedMenuId)?.name}
                  </p>
                )}
              </div>
              <Dialog open={showCreateItemDialog} onOpenChange={setShowCreateItemDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" disabled={!selectedMenuId}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Item</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="item-name">Item Name</Label>
                      <Input
                        id="item-name"
                        placeholder="Enter item name"
                        value={newItem.name}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="item-details">Details</Label>
                      <Textarea
                        id="item-details"
                        placeholder="Enter item details"
                        value={newItem.details}
                        onChange={(e) => setNewItem({...newItem, details: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="item-price">Price</Label>
                        <Input
                          id="item-price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={newItem.price}
                          onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="item-stock">Stock</Label>
                        <Input
                          id="item-stock"
                          type="number"
                          min="0"
                          value={newItem.stock}
                          onChange={(e) => setNewItem({...newItem, stock: parseInt(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="item-veg"
                          checked={newItem.isVeg}
                          onCheckedChange={(checked) => setNewItem({...newItem, isVeg: checked})}
                        />
                        <Label htmlFor="item-veg">Vegetarian</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="item-available"
                          checked={newItem.isAvailable}
                          onCheckedChange={(checked) => setNewItem({...newItem, isAvailable: checked})}
                        />
                        <Label htmlFor="item-available">Available</Label>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setShowCreateItemDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createItem} disabled={!newItem.name.trim()}>
                        Create Item
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {!selectedMenuId ? (
                <div className="text-center py-8 text-gray-500">
                  Select a menu to view items
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No items found for this menu
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {items.map((item) => (
                    <Card key={item.id} className="relative">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-lg">{item.name}</h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {item.details}
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <Badge variant={item.isVeg ? "outline" : "secondary"}>
                                {item.isVeg ? "Veg" : "Non-Veg"}
                              </Badge>
                              <Badge variant={item.isAvailable ? "default" : "destructive"}>
                                {item.isAvailable ? "Available" : "Unavailable"}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-lg font-semibold">₹{item.price}</span>
                              <span className="text-sm text-gray-500">Stock: {item.stock}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-2">
                              Created by: {item.createdBy}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 ml-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleItemAvailability(item.id)}
                              className="h-8 w-8 p-0"
                            >
                              {item.isAvailable ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditItemDialog(item)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setDeleteTarget({ type: 'item', id: item.id, name: item.name });
                                setDeleteDialogOpen(true);
                              }}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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

      {/* Edit Menu Dialog */}
      <Dialog open={showEditMenuDialog} onOpenChange={setShowEditMenuDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Menu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-menu-name">Menu Name</Label>
              <Input
                id="edit-menu-name"
                value={editingMenu.name}
                onChange={(e) => setEditingMenu({...editingMenu, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-menu-details">Details</Label>
              <Textarea
                id="edit-menu-details"
                value={editingMenu.details}
                onChange={(e) => setEditingMenu({...editingMenu, details: e.target.value})}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-menu-rating">Rating</Label>
              <Input
                id="edit-menu-rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={editingMenu.rating}
                onChange={(e) => setEditingMenu({...editingMenu, rating: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-menu-active"
                checked={editingMenu.isActive}
                onCheckedChange={(checked) => setEditingMenu({...editingMenu, isActive: checked})}
              />
              <Label htmlFor="edit-menu-active">Active</Label>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditMenuDialog(false)}>
                Cancel
              </Button>
              <Button onClick={updateMenu}>
                Update Menu
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={showEditItemDialog} onOpenChange={setShowEditItemDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-item-name">Item Name</Label>
              <Input
                id="edit-item-name"
                value={editingItem.name}
                onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-item-details">Details</Label>
              <Textarea
                id="edit-item-details"
                value={editingItem.details}
                onChange={(e) => setEditingItem({...editingItem, details: e.target.value})}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-item-price">Price</Label>
                <Input
                  id="edit-item-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="edit-item-stock">Stock</Label>
                <Input
                  id="edit-item-stock"
                  type="number"
                  min="0"
                  value={editingItem.stock}
                  onChange={(e) => setEditingItem({...editingItem, stock: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-item-veg"
                  checked={editingItem.isVeg}
                  onCheckedChange={(checked) => setEditingItem({...editingItem, isVeg: checked})}
                />
                <Label htmlFor="edit-item-veg">Vegetarian</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-item-available"
                  checked={editingItem.isAvailable}
                  onCheckedChange={(checked) => setEditingItem({...editingItem, isAvailable: checked})}
                />
                <Label htmlFor="edit-item-available">Available</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditItemDialog(false)}>
                Cancel
              </Button>
              <Button onClick={updateItem}>
                Update Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {deleteTarget.type} "{deleteTarget.name}".
              {deleteTarget.type === 'menu' && ' This will also delete all items in this menu.'}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Menu View Link */}
      <div className="fixed bottom-6 right-6">
        <Link to="/customer/menus">
          <Button className="rounded-full shadow-lg">
            <Eye className="w-4 h-4 mr-2" />
            Customer View
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MenuPage;