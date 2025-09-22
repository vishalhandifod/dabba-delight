import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import { use } from 'react';

const AddressPage = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [items , setItems] = useState([]);
  const [formData, setFormData] = useState({
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
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/addresses');
      setAddresses(response.data);
      
      // If no addresses exist, show the add form
      if (response.data.length === 0) {
        setShowAddForm(true);
      }
    } catch (error) {
      toast({ 
        title: 'Error fetching addresses', 
        description: error.response?.data?.message || error.message, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      flatOrBlock: '',
      city: '',
      pincode: ''
    });
    setEditingAddress(null);
    setShowAddForm(false);
  };

  const createAddress = async () => {
    // Basic validation
    if (!formData.addressLine1 || !formData.city || !formData.pincode) {
      toast({ 
        title: 'Validation Error', 
        description: 'Address Line 1, City, and Pincode are required', 
        variant: 'destructive' 
      });
      return;
    }

    try {
      await api.post('/addresses', formData);
      toast({ title: 'Address created successfully' });
      resetForm();
      fetchAddresses();
    } catch (error) {
      toast({ 
        title: 'Error creating address', 
        description: error.response?.data?.message || error.message, 
        variant: 'destructive' 
      });
    }
  };

  const updateAddress = async () => {
    if (!editingAddress) return;

    // Basic validation
    if (!formData.addressLine1 || !formData.city || !formData.pincode) {
      toast({ 
        title: 'Validation Error', 
        description: 'Address Line 1, City, and Pincode are required', 
        variant: 'destructive' 
      });
      return;
    }

    try {
      await api.put(`/addresses/${editingAddress.id}`, formData);
      toast({ title: 'Address updated successfully' });
      resetForm();
      fetchAddresses();
    } catch (error) {
      toast({ 
        title: 'Error updating address', 
        description: error.response?.data?.message || error.message, 
        variant: 'destructive' 
      });
    }
  };

  const deleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await api.delete(`/addresses/${addressId}`);
      toast({ title: 'Address deleted successfully' });
      fetchAddresses();
    } catch (error) {
      toast({ 
        title: 'Error deleting address', 
        description: error.response?.data?.message || error.message, 
        variant: 'destructive' 
      });
    }
  };

  const startEdit = (address) => {
    setFormData({
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      landmark: address.landmark || '',
      flatOrBlock: address.flatOrBlock || '',
      city: address.city || '',
      pincode: address.pincode || ''
    });
    setEditingAddress(address);
    setShowAddForm(true);
  };

  const proceedToPayment = () => {
    // Navigate to payment page or next step in checkout process
    // You can pass selected address data if needed
    navigate('/payment');
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };
   const cartData = JSON.parse(localStorage.getItem('dabbadelight_cart') || '[]');

useEffect(() => {
  setItems(cartData);
}, []);

useEffect(() => {
  console.log('Updated Items State:', items);
}, [items]);

  const handleOrderNow = async () => {
    if (!selectedAddress) {
      toast({ 
        title: 'Select Address', 
        description: 'Please select a delivery address', 
        variant: 'destructive' 
      });
      return;
    }

    // Get cart data from localStorage or context

   
    if (!cartData || cartData.length === 0) {
      toast({ 
        title: 'Empty Cart', 
        description: 'Please add items to cart before ordering', 
        variant: 'destructive' 
      });
      return;
    }

    try {
      setOrderLoading(true);
      
      // Create order payload
      const orderPayload = {
        addressId: selectedAddress.id,
        paymentMode: 'CASH',
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING',
        adminId: cartData[0]?.menuId,
        orderItems: cartData.map(item => ({

          itemId: item.id,
          quantity: item.quantity,
          priceAtPurchase: item.price
        })),
      };
      

      const response = await api.post('/order', orderPayload);
      
      toast({ 
        title: 'Order Placed Successfully!', 
        description: `Order ID: ${response.data.orderId}` 
      });
      
      // Clear cart after successful order
      localStorage.removeItem('dabbadelight_cart');
      
      // Navigate to orders page
      navigate('/orders');
      
    } catch (error) {
      toast({ 
        title: 'Order Failed', 
        description: error.response?.data?.message || error.message, 
        variant: 'destructive' 
      });
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading addresses...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery Addresses</h1>
        <p className="text-gray-600">Manage your delivery addresses</p>
      </div>

      {/* Add/Edit Address Form */}
      {showAddForm && (
        <Card className="mb-8 border-2 border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-600" />
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Input
                  placeholder="Address Line 1 *"
                  value={formData.addressLine1}
                  onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                  className="border-orange-200 focus:border-orange-400"
                />
              </div>
              <Input
                placeholder="Address Line 2"
                value={formData.addressLine2}
                onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                className="border-orange-200 focus:border-orange-400"
              />
              <Input
                placeholder="Landmark"
                value={formData.landmark}
                onChange={(e) => handleInputChange('landmark', e.target.value)}
                className="border-orange-200 focus:border-orange-400"
              />
              <Input
                placeholder="Flat/Block/House No."
                value={formData.flatOrBlock}
                onChange={(e) => handleInputChange('flatOrBlock', e.target.value)}
                className="border-orange-200 focus:border-orange-400"
              />
              <Input
                placeholder="City *"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="border-orange-200 focus:border-orange-400"
              />
              <Input
                placeholder="Pincode *"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                className="border-orange-200 focus:border-orange-400"
                maxLength="6"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={editingAddress ? updateAddress : createAddress}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                {editingAddress ? 'Update Address' : 'Save Address'}
              </Button>
              <Button 
                variant="outline" 
                onClick={resetForm}
                className="border-orange-200 hover:bg-orange-50"
              >
                Cancel
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">* Required fields</p>
          </CardContent>
        </Card>
      )}

      {/* Existing Addresses */}
      {addresses.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Your Addresses</h2>
            {!showAddForm && (
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Address
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {addresses.map((address) => (
              <Card 
                key={address.id} 
                className={`hover:shadow-lg transition-all cursor-pointer border-2 ${
                  selectedAddress?.id === address.id 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-orange-100 hover:border-orange-300'
                }`}
                onClick={() => handleAddressSelect(address)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                    <span className="line-clamp-2">{address.addressLine1}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                    {address.flatOrBlock && <p>Flat/Block: {address.flatOrBlock}</p>}
                    {address.landmark && <p>Near: {address.landmark}</p>}
                    <p className="font-medium">{address.city} - {address.pincode}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(address)}
                      className="flex-1 border-orange-200 hover:bg-orange-50 text-orange-700"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAddress(address.id)}
                      className="flex-1 border-red-200 hover:bg-red-50 text-red-700"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Now Button */}
          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to place your order?</h3>
              <p className="text-gray-600 mb-4">Select an address above and place your order</p>
              <Button
                onClick={handleOrderNow}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                size="lg"
                disabled={!selectedAddress || orderLoading}
              >
                {orderLoading ? 'Placing Order...' : 'Order Now'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // No addresses exist
        !showAddForm && (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No addresses found</h2>
            <p className="text-gray-600 mb-6">Add your first delivery address to continue</p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Address
            </Button>
          </div>
        )
      )}
    </div>
  );
};

export default AddressPage;