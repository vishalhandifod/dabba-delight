import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const MenuPage = () => {
  const [menus, setMenus] = useState([]);
  const [newMenu, setNewMenu] = useState({ name: '', details: '' });
  const { toast } = useToast();

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await api.get('/menu');
      setMenus(response.data);
    } catch (error) {
      toast({ title: 'Error fetching menus', description: error.message, variant: 'destructive' });
    }
  };

  const createMenu = async () => {
    try {
      await api.post('/menu', newMenu);
      setNewMenu('');
      fetchMenus();
      toast({ title: 'Menu created' });
    } catch (error) {
      toast({ title: 'Error creating menu', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Menu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Enter menu name"
              value={newMenu.name}
              onChange={(e) => setNewMenu({...newMenu, name: e.target.value})}
            />
            <Input
              placeholder="Enter details"
              value={newMenu.details}
              onChange={(e) => setNewMenu({ ...newMenu, details: e.target.value})}
            />
            <Button onClick={createMenu} className="md:col-span-2">Create</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {menus.map((menu) => (
          <Card key={menu.id}>
            <CardHeader>
              <CardTitle>{menu.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{menu.details}</p>
              <div className="flex gap-4 mt-2">
                <Link to={`/item/menu/${menu.id}`}>
                  <Button>View Items</Button>
                </Link>
                <Link to={`/kitchen-address/menu/${menu.id}`}>
                  <Button>View Kitchen Address</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
