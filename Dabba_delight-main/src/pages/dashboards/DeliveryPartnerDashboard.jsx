import React from 'react';
import { motion } from 'framer-motion';
import { Bike, MapPin, CheckCircle, Clock, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockDeliveries = [
  { 
    id: 'del_001', 
    housewifeName: 'Priya Cooks', 
    housewifeAddress: '12B, Spice Apartments, Flavor Town', 
    customerName: 'Rohan Customer', 
    customerAddress: 'A-401, Tech Park Homes, Silicon Valley', 
    items: ['Classic Veg Thali (2)', 'Extra Roti (4)'], 
    pickupTime: '2025-05-23T12:30:00', 
    expectedDeliveryTime: '2025-05-23T13:15:00',
    status: 'Pending Pickup' // Pending Pickup, Picked Up, Out for Delivery, Delivered, Cancelled
  },
  { 
    id: 'del_002', 
    housewifeName: 'Anita\'s Kitchen', 
    housewifeAddress: '7, Rose Villa, Green Gardens', 
    customerName: 'Sneha User', 
    customerAddress: 'Flat 9C, Riverview Heights, Waterside', 
    items: ['North Indian Special (1)', 'Sweet Lassi (1)'], 
    pickupTime: '2025-05-23T18:00:00', 
    expectedDeliveryTime: '2025-05-23T18:45:00',
    status: 'Picked Up' 
  },
];


const DeliveryPartnerDashboard = () => {
  const { toast } = useToast();
  const user = JSON.parse(localStorage.getItem('dabbaDelightUser'));
  const [deliveries, setDeliveries] = React.useState([]);

  React.useEffect(() => {
    if (!user) return;
    const storedDeliveries = JSON.parse(localStorage.getItem(`deliveryJobs_${user.email}`)) || mockDeliveries;
    setDeliveries(storedDeliveries.map(d => ({...d, status: d.status || 'Pending Pickup'})));
  }, [user]);

  const updateDeliveryStatus = (deliveryId, newStatus) => {
    setDeliveries(prevDeliveries => {
      const updated = prevDeliveries.map(d => 
        d.id === deliveryId ? { ...d, status: newStatus } : d
      );
      localStorage.setItem(`deliveryJobs_${user.email}`, JSON.stringify(updated));
      return updated;
    });
    toast({
      title: "Delivery Status Updated",
      description: `Delivery ${deliveryId} marked as ${newStatus}.`,
    });
  };

  if (!user || user.userType !== 'deliveryPartner') {
    return (
      <div className="min-h-[calc(100vh-13rem)] bg-yellow-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-10 rounded-lg shadow-xl"
        >
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700">You must be logged in as a Delivery Partner to view this page.</p>
        </motion.div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending Pickup': return 'bg-yellow-200 text-yellow-800';
      case 'Picked Up': return 'bg-blue-200 text-blue-800';
      case 'Out for Delivery': return 'bg-purple-200 text-purple-800';
      case 'Delivered': return 'bg-green-200 text-green-800';
      case 'Cancelled': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };


  return (
    <div className="min-h-[calc(100vh-13rem)] bg-gradient-to-br from-teal-100 via-cyan-100 to-sky-100 p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto"
      >
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-teal-700">Welcome, {user.name || user.email}!</h1>
          <p className="text-xl text-gray-600 mt-2">Your Delivery Dashboard</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="md:col-span-2 lg:col-span-3 hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-teal-700"><ListChecks className="mr-3"/>Assigned Deliveries</CardTitle>
              <CardDescription>Manage your current delivery tasks.</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto">
              {deliveries.length > 0 ? (
                <div className="space-y-6">
                  {deliveries.map(delivery => (
                    <motion.div 
                      key={delivery.id}
                      className="p-6 border rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold text-teal-800 mb-1 sm:mb-0">Delivery ID: {delivery.id}</h3>
                        <span className={`px-3 py-1 text-sm font-bold rounded-full ${getStatusColor(delivery.status)}`}>
                          {delivery.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">From: {delivery.housewifeName}</p>
                          <p className="text-gray-500 flex items-center"><MapPin size={14} className="mr-1 text-orange-500"/> {delivery.housewifeAddress}</p>
                          <p className="text-gray-500 flex items-center"><Clock size={14} className="mr-1 text-orange-500"/> Pickup: {new Date(delivery.pickupTime).toLocaleTimeString()}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">To: {delivery.customerName}</p>
                          <p className="text-gray-500 flex items-center"><MapPin size={14} className="mr-1 text-green-500"/> {delivery.customerAddress}</p>
                          <p className="text-gray-500 flex items-center"><Clock size={14} className="mr-1 text-green-500"/> Deliver by: {new Date(delivery.expectedDeliveryTime).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="font-medium text-gray-700 text-sm">Items:</p>
                        <ul className="list-disc list-inside pl-4 text-sm text-gray-600">
                          {delivery.items.map((item, idx) => <li key={idx}>{item}</li>)}
                        </ul>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <Select 
                          value={delivery.status}
                          onValueChange={(newStatus) => updateDeliveryStatus(delivery.id, newStatus)}
                        >
                          <SelectTrigger className="w-full sm:w-auto text-sm h-10">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending Pickup">Pending Pickup</SelectItem>
                            <SelectItem value="Picked Up">Picked Up</SelectItem>
                            <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                            <SelectItem value="Cancelled">Cancelled by Customer</SelectItem>
                            <SelectItem value="Undeliverable">Undeliverable</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" className="w-full sm:w-auto border-teal-500 text-teal-600 hover:bg-teal-50 text-sm">
                          <MapPin size={16} className="mr-2"/> View Route
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No deliveries assigned at the moment. Check back soon!</p>
              )}
            </CardContent>
          </Card>

          {/* Placeholder for other cards like "Delivery History", "Earnings" */}
          {/* 
          <Card>
            <CardHeader>
              <CardTitle>Delivery History</CardTitle>
            </CardHeader>
            <CardContent>
              <p>View past deliveries...</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>My Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Track your earnings...</p>
            </CardContent>
          </Card>
          */}
        </div>
      </motion.div>
    </div>
  );
};

export default DeliveryPartnerDashboard;