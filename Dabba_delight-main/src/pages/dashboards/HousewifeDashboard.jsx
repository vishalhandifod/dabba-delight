import React from 'react';
import { motion } from 'framer-motion';
import { ChefHat, ListOrdered, PlusCircle, Carrot, Milk, Wheat, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const rawMaterialsList = [
  { id: 'flour', name: 'Wheat Flour (Atta)', icon: <Wheat className="h-5 w-5 mr-2 text-yellow-600" /> },
  { id: 'rice', name: 'Basmati Rice', icon: <ListOrdered className="h-5 w-5 mr-2 text-gray-500" /> },
  { id: 'onions', name: 'Onions', icon: <Carrot className="h-5 w-5 mr-2 text-purple-500" /> },
  { id: 'tomatoes', name: 'Tomatoes', icon: <Carrot className="h-5 w-5 mr-2 text-red-500" /> },
  { id: 'potatoes', name: 'Potatoes', icon: <Carrot className="h-5 w-5 mr-2 text-yellow-700" /> },
  { id: 'lentils', name: 'Mixed Lentils (Dal)', icon: <ListOrdered className="h-5 w-5 mr-2 text-green-600" /> },
  { id: 'spices', name: 'Basic Spice Mix', icon: <ListOrdered className="h-5 w-5 mr-2 text-red-700" /> },
  { id: 'oil', name: 'Cooking Oil', icon: <Milk className="h-5 w-5 mr-2 text-yellow-500" /> },
  { id: 'milk', name: 'Milk / Paneer', icon: <Milk className="h-5 w-5 mr-2 text-blue-300" /> },
];

const HousewifeDashboard = () => {
  const { toast } = useToast();
  const user = JSON.parse(localStorage.getItem('dabbaDelightUser'));
  
  const [selectedMaterials, setSelectedMaterials] = React.useState(() => {
    if (!user) return {};
    const saved = localStorage.getItem(`housewifeMaterials_${user.email}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [myRequests, setMyRequests] = React.useState([]);

  React.useEffect(() => {
    if (!user) return;
    const fetchRequests = () => {
      const allRequests = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(`materialRequest_${user.email}_`)) {
          const requestData = JSON.parse(localStorage.getItem(key));
          const [, , timestampStr] = key.split('_');
          const status = localStorage.getItem(`materialRequestStatus_${key}`) || "Pending";
          allRequests.push({ 
            id: key, 
            items: requestData.items || requestData, 
            timestamp: new Date(parseInt(timestampStr)).toLocaleString(),
            status: status
          });
        }
      }
      setMyRequests(allRequests.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
    };
    fetchRequests();
     window.addEventListener('storage', fetchRequests);
    return () => window.removeEventListener('storage', fetchRequests);
  }, [user]);


  if (!user || user.userType !== 'housewife') {
    return (
      <div className="min-h-[calc(100vh-13rem)] bg-yellow-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-10 rounded-lg shadow-xl"
        >
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700">You must be logged in as a housewife to view this page.</p>
        </motion.div>
      </div>
    );
  }
  
  const handleMaterialChange = (materialId) => {
    setSelectedMaterials(prev => {
      const newSelection = { ...prev, [materialId]: !prev[materialId] };
      localStorage.setItem(`housewifeMaterials_${user.email}`, JSON.stringify(newSelection));
      return newSelection;
    });
  };

  const handleSubmitRequest = () => {
    const requestedItems = Object.entries(selectedMaterials)
      .filter(([,isSelected]) => isSelected)
      .map(([id]) => rawMaterialsList.find(m => m.id === id)?.name);

    if (requestedItems.length === 0) {
      toast({
        title: "No Materials Selected",
        description: "Please select some materials before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    const requestKey = `materialRequest_${user.email}_${Date.now()}`;
    const requestData = {
      housewifeEmail: user.email,
      housewifeName: user.name || user.email,
      items: requestedItems,
      timestamp: new Date().toISOString(),
      status: "Pending" 
    };
    localStorage.setItem(requestKey, JSON.stringify(requestData));
    localStorage.setItem(`materialRequestStatus_${requestKey}`, "Pending");


    toast({
      title: "Request Submitted!",
      description: `Your request for ${requestedItems.join(', ')} has been sent.`,
    });
    setSelectedMaterials({}); 
    localStorage.removeItem(`housewifeMaterials_${user.email}`);
    
    const updatedRequests = [...myRequests, { id: requestKey, items: requestedItems, timestamp: new Date(requestData.timestamp).toLocaleString(), status: "Pending" }];
    setMyRequests(updatedRequests.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
  };


  return (
    <div className="min-h-[calc(100vh-13rem)] bg-gradient-to-br from-green-100 via-lime-100 to-emerald-100 p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto"
      >
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-green-700">Namaste, {user.name || user.email}!</h1>
          <p className="text-xl text-gray-600 mt-2">Your Home Cook Dashboard</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            className="lg:col-span-2 bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow"
          >
            <div className="flex items-center mb-6">
              <ChefHat className="h-10 w-10 text-green-600 mr-3" />
              <h2 className="text-3xl font-semibold text-gray-800">Request Raw Materials</h2>
            </div>
            <p className="text-gray-600 mb-6">Select the ingredients you need for your upcoming Dabbas. Your vendor will be notified.</p>
            
            <div className="space-y-4 mb-8 max-h-96 overflow-y-auto pr-2">
              {rawMaterialsList.map(material => (
                <motion.div 
                  key={material.id}
                  whileHover={{ backgroundColor: "rgba(230, 255, 230, 0.5)"}}
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-green-400 transition-colors"
                >
                  <Checkbox
                    id={material.id}
                    checked={!!selectedMaterials[material.id]}
                    onCheckedChange={() => handleMaterialChange(material.id)}
                    className="mr-3 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />
                  {material.icon}
                  <Label htmlFor={material.id} className="text-md font-medium text-gray-700 cursor-pointer flex-grow">
                    {material.name}
                  </Label>
                </motion.div>
              ))}
            </div>
            <Button 
              size="lg" 
              onClick={handleSubmitRequest}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-lg py-3.5 rounded-lg shadow-md"
            >
              Submit Material Request
            </Button>
          </motion.div>

          <div className="space-y-8">
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-green-700"><FileText className="mr-2"/>My Material Requests</CardTitle>
                <CardDescription>Track the status of your submitted requests.</CardDescription>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                {myRequests.length > 0 ? (
                  <div className="space-y-3">
                    {myRequests.map(req => (
                      <div key={req.id} className="p-3 border rounded-md bg-green-50 text-sm">
                        <p className="font-medium text-green-800">Request ID: ...{req.id.slice(-6)}</p>
                        <p className="text-xs text-gray-500">{req.timestamp}</p>
                        <p>Items: {req.items.join(', ')}</p>
                        <p>Status: <span className={`font-semibold ${req.status === 'Pending' ? 'text-yellow-600' : req.status === 'Processed' ? 'text-blue-600' : req.status === 'Out for Delivery' ? 'text-purple-600' : 'text-gray-600'}`}>{req.status}</span></p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">You haven't made any material requests yet.</p>
                )}
              </CardContent>
            </Card>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all"
            >
              <ListOrdered className="h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">My Menu</h2>
              <p className="text-gray-600 mb-4">Manage the dishes you offer and update availability.</p>
              <Button variant="link" className="text-green-600 font-semibold p-0 h-auto">Manage Menu &rarr;</Button>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all"
            >
              <PlusCircle className="h-12 w-12 text-lime-500 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Upcoming Orders</h2>
              <p className="text-gray-600 mb-4">View and prepare for your scheduled Dabba deliveries.</p>
              <Button variant="link" className="text-lime-600 font-semibold p-0 h-auto">View Orders &rarr;</Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HousewifeDashboard;