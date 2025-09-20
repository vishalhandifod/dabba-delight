import React, { useState, useEffect } from 'react';
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
} from '@/components/ui/dialog';
import api from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const AddMenu = ({ isOpen, onOpenChange, onMenuCreated }) => {
  const [menuData, setMenuData] = useState({
    name: '',
    details: '',
    rating: 0,
    isActive: true,
  });
  const { toast } = useToast();

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setMenuData({ name: '', details: '', rating: 0, isActive: true });
    }
  }, [isOpen]);

  const createMenu = async () => {
    try {
      await api.post('/menu', menuData);
      toast({ title: 'Success', description: 'Menu created successfully' });
      onOpenChange(false);
      onMenuCreated && onMenuCreated();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create menu',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              value={menuData.name}
              onChange={(e) => setMenuData({ ...menuData, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="menu-details">Details</Label>
            <Textarea
              id="menu-details"
              placeholder="Enter menu details"
              value={menuData.details}
              onChange={(e) => setMenuData({ ...menuData, details: e.target.value })}
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="menu-active"
              checked={menuData.isActive}
              onCheckedChange={(checked) => setMenuData({ ...menuData, isActive: checked })}
            />
            <Label htmlFor="menu-active">Active</Label>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={createMenu} disabled={!menuData.name.trim()}>
              Create Menu
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddMenu;
