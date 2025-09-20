import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const AddItem = ({ menuId, onItemCreated }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [itemData, setItemData] = useState({
    name: '',
    details: '',
    price: 0,
    stock: 0,
    isVeg: true,
    isAvailable: true,
  });

  const { toast } = useToast();

  const createItem = async () => {
    if (!menuId) {
      toast({ title: 'Error', description: 'Please select a menu first', variant: 'destructive' });
      return;
    }

    try {
      await api.post(`/item/menu/${menuId}`, itemData);
      toast({ title: 'Success', description: 'Item created successfully' });
      setShowDialog(false);
      setItemData({
        name: '',
        details: '',
        price: 0,
        stock: 0,
        isVeg: true,
        isAvailable: true,
      });
      onItemCreated && onItemCreated();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create item',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={!menuId}>
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
              value={itemData.name}
              onChange={(e) => setItemData({ ...itemData, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="item-details">Details</Label>
            <Textarea
              id="item-details"
              placeholder="Enter item details"
              value={itemData.details}
              onChange={(e) => setItemData({ ...itemData, details: e.target.value })}
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
                value={itemData.price}
                onChange={(e) => setItemData({ ...itemData, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="item-stock">Stock</Label>
              <Input
                id="item-stock"
                type="number"
                min="0"
                value={itemData.stock}
                onChange={(e) => setItemData({ ...itemData, stock: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="item-veg"
                checked={itemData.isVeg}
                onCheckedChange={(checked) => setItemData({ ...itemData, isVeg: checked })}
              />
              <Label htmlFor="item-veg">Vegetarian</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="item-available"
                checked={itemData.isAvailable}
                onCheckedChange={(checked) => setItemData({ ...itemData, isAvailable: checked })}
              />
              <Label htmlFor="item-available">Available</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createItem} disabled={!itemData.name.trim()}>
              Create Item
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddItem;
