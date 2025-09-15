import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const KitchenAddressPage = () => {
  const { menuId } = useParams();
  const [kitchenAddresses, setKitchenAddresses] = useState([]);
  const [newKitchenAddress, setNewKitchenAddress] = useState({ addressLine1: '', addressLine2: '', landmark: '', city: '', pincode: '' });
  const { toast } = useToast();

  useEffect(() => {
    if (menuId) {
      fetchKitchenAddresses(menuId);
    }
  }, [menuId]);

  const fetchKitchenAddresses = async (id) => {
    try {
      const response = await api.get(`/kitchen_address/menu/${id}`);
      setKitchenAddresses(response.data);
    } catch (error) {
      toast({ title: 'Error fetching kitchen addresses', description: error.message, variant: 'destructive' });
    }
  };

  const createKitchenAddress = async () => {
    try {
      await api.post(`/kitchen_address/menu/${menuId}`, newKitchenAddress);
      setNewKitchenAddress({ addressLine1: '', addressLine2: '', landmark: '', city: '', pincode: ''});
      fetchKitchenAddresses(menuId);
      toast({ title: 'Kitchen address created' });
    } catch (error) {
      toast({ title: 'Error creating kitchen address', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Kitchen Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Address Line 1"
              value={newKitchenAddress.addressLine1}
              onChange={(e) => setNewKitchenAddress({ ...newKitchenAddress, addressLine1: e.target.value })}
            />
            <Input
              placeholder="Address Line 2"
              value={newKitchenAddress.addressLine2}
              onChange={(e) => setNewKitchenAddress({ ...newKitchenAddress, addressLine2: e.target.value })}
            />
            <Input
              placeholder="Landmark"
              value={newKitchenAddress.landmark}
              onChange={(e) => setNewKitchenAddress({ ...newKitchenAddress, landmark: e.target.value })}
            />
            <Input
              placeholder="City"
              value={newKitchenAddress.city}
              onChange={(e) => setNewKitchenAddress({ ...newKitchenAddress, city: e.target.value })}
            />
            <Input
              placeholder="Pincode"
              value={newKitchenAddress.pincode}
              onChange={(e) => setNewKitchenAddress({ ...newKitchenAddress, pincode: e.target.value })}
            />
            <Button onClick={createKitchenAddress} className="md:col-span-2">Create</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kitchenAddresses.map((address) => (
          <Card key={address.id}>
            <CardHeader>
              <CardTitle>{address.addressLine1}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{address.addressLine2}, {address.landmark}, {address.city} {address.pincode}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default KitchenAddressPage;
