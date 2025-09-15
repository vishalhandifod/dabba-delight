import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Package, ClipboardList, Users, CheckCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';


const VendorDashboard = () => {
  const { toast } = useToast();
  const user = JSON.parse(localStorage.getItem('dabbaDelightUser'));
  const [materialRequests, setMaterialRequests] = React.useState([]);
  const [assignedHousewives, setAssignedHousewives] = React.useState([]);

  const fetchAllData = React.useCallback(() => {
    if (!user) return;

    const requests = [];
    const housewives = new Set();
    const allUsers = JSON.parse(localStorage.getItem('dabbaDelightUsers')) || [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('materialRequest_')) {
        const requestData = JSON.parse(localStorage.getItem(key));
        if (requestData) {
          housewives.add(requestData.housewifeEmail);
          const status = localStorage.getItem(`materialRequestStatus_${key}`) || "Pending";
          requests.push({ 
            id: key, 
            ...requestData, 
            timestampDisplay: new Date(requestData.timestamp).toLocaleString(),
            status: status
          });
        }
      }
    }
    setMaterialRequests(requests.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
    
    const vendorHousewives = allUsers.filter(u => u.userType === 'housewife' && housewives.has(u.email));
    setAssignedHousewives(vendorHousewives);

  }, [user]);


  React.useEffect(() => {
    fetchAllData();
    window.addEventListener('storage', fetchAllData);
    return () => window.removeEventListener('storage', fetchAllData);
  }, [fetchAllData]);


  if (!user || user.userType !== 'vendor') {
    return (
      <div className="min-h-[calc(100vh-13rem)] bg-yellow-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-10 rounded-lg shadow-xl"
        >
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700">You must be logged in as a vendor to view this page.</p>
        </motion.div>
      </div>
    );
  }

  const handleStatusChange = (requestId, newStatus) => {
    localStorage.setItem(`materialRequestStatus_${requestId}`, newStatus);
    setMaterialRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );
    toast({
      title: "Status Updated",
      description: `Request ${requestId.slice(-6)} status changed to ${newStatus}.`,
    });
  };

  return (
    <div className="min-h-[calc(100vh-13rem)] bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto"
      >
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700">Hello, {user.name || user.email}!</h1>
          <p className="text-xl text-gray-600 mt-2">Your Vendor Dashboard</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            className="lg:col-span-2"
          >
            <Card className="hover:shadow-xl transition-shadow h-full">
              <CardHeader>
                <CardTitle className="flex items-center text-indigo-700"><ClipboardList className="mr-3"/>Pending Material Requests</CardTitle>
                <CardDescription>Review and process material requests from housewives.</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto pr-2">
                {materialRequests.length > 0 ? (
                  <div className="space-y-4">
                    {materialRequests.map(req => (
                      <motion.div 
                        key={req.id} 
                        className="p-4 border rounded-lg bg-indigo-50 hover:bg-indigo-100"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-indigo-700">From: {req.housewifeName || req.housewifeEmail}</p>
                            <p className="text-sm text-gray-500">Requested on: {req.timestampDisplay}</p>
                          </div>
                           <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              req.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' : 
                              req.status === 'Processed' ? 'bg-blue-200 text-blue-800' :
                              req.status === 'Out for Delivery' ? 'bg-purple-200 text-purple-800' :
                              'bg-gray-200 text-gray-800'
                            }`}>{req.status}</span>
                        </div>
                        <ul className="list-disc list-inside mt-2 pl-4 text-sm text-gray-700">
                          {req.items.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                        <div className="mt-3 flex items-center space-x-2">
                          <Select 
                            value={req.status} 
                            onValueChange={(newStatus) => handleStatusChange(req.id, newStatus)}
                          >
                            <SelectTrigger className="w-auto text-xs h-8">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Processed">Processed</SelectItem>
                              <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                              <SelectItem value="Delivered">Delivered</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          {req.status === "Processed" && (
                             <Button size="sm" variant="outline" className="text-xs h-8 border-purple-500 text-purple-600 hover:bg-purple-50">
                                <Truck className="h-3 w-3 mr-1" /> Assign for Delivery
                              </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No pending material requests at the moment.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <div className="space-y-8">
            <Card className="hover:shadow-xl transition-shadow">
               <CardHeader>
                <CardTitle className="flex items-center text-indigo-700"><Users className="mr-2"/>Assigned Housewives</CardTitle>
                <CardDescription>Your network of home cooks.</CardDescription>
              </CardHeader>
              <CardContent className="max-h-60 overflow-y-auto">
                {assignedHousewives.length > 0 ? (
                  <ul className="space-y-2">
                    {assignedHousewives.map(hw => (
                      <li key={hw.email} className="text-sm p-2 bg-indigo-50 rounded-md">{hw.name} ({hw.email})</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No housewives currently assigned or active.</p>
                )}
              </CardContent>
            </Card>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all"
            >
              <Package className="h-10 w-10 text-blue-500 mb-3" />
              <h2 className="text-xl font-semibold text-gray-800 mb-1">Inventory</h2>
              <p className="text-gray-600 text-sm mb-3">Track stock levels and manage products.</p>
              <Button variant="link" className="text-blue-600 font-semibold p-0 h-auto text-sm">Manage Inventory &rarr;</Button>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all"
            >
              <Truck className="h-10 w-10 text-purple-500 mb-3" />
              <h2 className="text-xl font-semibold text-gray-800 mb-1">Delivery Ops</h2>
              <p className="text-gray-600 text-sm mb-3">Organize and view delivery schedules.</p>
              <Button variant="link" className="text-purple-600 font-semibold p-0 h-auto text-sm">View Schedule &rarr;</Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VendorDashboard;