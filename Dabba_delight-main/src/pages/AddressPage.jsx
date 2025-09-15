import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const AddressPage = () => {
  const { userId } = useParams();
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    flatOrBlock: '',
    city: '',
    pincode: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchAddresses();
  }, [userId]);

  const fetchAddresses = async () => {
    try {
      const response = await api.get(`/user/address/${userId}/address`);
      setAddresses(response.data);
    } catch (error) {
      toast({ title: 'Error fetching addresses', description: error.message, variant: 'destructive' });
    }
  };

  const createAddress = async () => {
    try {
      await api.post(`/user/address/users/${userId}/addresses`, newAddress);
      setNewAddress({ addressLine1: '', addressLine2: '', landmark: '', flatOrBlock: '', city: '', pincode: '' });
      fetchAddresses();
      toast({ title: 'Address created' });
    } catch (error) {
      toast({ title: 'Error creating address', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Add. Line 1"
              value={newAddress.addressLine1}
              onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
            />
            <Input
              placeholder="Add. Line 2"
              value={newAddress.addressLine2}
              onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
            />
            <Input
              placeholder="Landmark"
              value={newAddress.landmark}
              onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
            />
            <Input
              placeholder="Flat/Block No."
              value={newAddress.flatOrBlock}
              onChange={(e) => setNewAddress({ ...newAddress, flatOrBlock: e.target.value })}
            />
            <Input
              placeholder="City"
              value={newAddress.city}
              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
            />
            <Input
              placeholder="Zip Code"
              value={newAddress.pinode}
              onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
            />
            <Button onClick={createAddress} className="md:col-span-2">Create</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {addresses.map((address) => (
          <Card key={address.id}>
            <CardHeader>
              <CardTitle>{address.addressLine1}</CardTitle>
            </CardHeader>
            <CardContent>
              <p> {address.addressLine2} {address.flatOrBlock}, {address.landmark}, {address.city} - {address.pincode}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AddressPage;
