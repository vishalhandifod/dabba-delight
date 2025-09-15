import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, ShoppingBag, ChefHat, Package, Bike, BarChart3, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminDashboard = () => {
  const { toast } = useToast();
  const user = JSON.parse(localStorage.getItem('dabbaDelightUser'));
  
  const [allUsers, setAllUsers] = React.useState([]);
  const [allRequests, setAllRequests] = React.useState([]);
  const [stats, setStats] = React.useState({
    totalUsers: 0, customers: 0, housewives: 0, vendors: 0, deliveryPartners: 0, admins: 0,
    totalRequests: 0, pendingRequests: 0, processedRequests: 0,
  });

  const fetchData = React.useCallback(() => {
    const usersFromStorage = JSON.parse(localStorage.getItem('dabbaDelightUsers')) || [];
    setAllUsers(usersFromStorage);

    let requests = [];
    let pending = 0;
    let processed = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('materialRequest_')) {
        const reqData = JSON.parse(localStorage.getItem(key));
        const status = localStorage.getItem(`materialRequestStatus_${key}`) || "Pending";
        requests.push({ id: key, ...reqData, status });
        if (status === "Pending") pending++;
        if (status === "Processed") processed++;
      }
    }
    setAllRequests(requests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));

    setStats({
      totalUsers: usersFromStorage.length,
      customers: usersFromStorage.filter(u => u.userType === 'customer').length,
      housewives: usersFromStorage.filter(u => u.userType === 'housewife').length,
      vendors: usersFromStorage.filter(u => u.userType === 'vendor').length,
      deliveryPartners: usersFromStorage.filter(u => u.userType === 'deliveryPartner').length,
      admins: usersFromStorage.filter(u => u.userType === 'admin').length,
      totalRequests: requests.length,
      pendingRequests: pending,
      processedRequests: processed,
    });
  }, []);

  React.useEffect(() => {
    fetchData();
    window.addEventListener('storage', fetchData);
    window.addEventListener('dabbaUserChanged', fetchData);
    return () => {
      window.removeEventListener('storage', fetchData);
      window.removeEventListener('dabbaUserChanged', fetchData);
    }
  }, [fetchData]);

  if (!user || user.userType !== 'admin') {
    return (
      <div className="min-h-[calc(100vh-13rem)] bg-gray-100 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-10 rounded-lg shadow-xl"
        >
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700">You must be logged in as an Admin to view this page.</p>
        </motion.div>
      </div>
    );
  }

  const handleDeleteUser = (emailToDelete) => {
    if (emailToDelete === user.email) {
      toast({ title: "Action Denied", description: "Admin cannot delete their own account.", variant: "destructive" });
      return;
    }
    const updatedUsers = allUsers.filter(u => u.email !== emailToDelete);
    localStorage.setItem('dabbaDelightUsers', JSON.stringify(updatedUsers));
    setAllUsers(updatedUsers); 
    fetchData(); 
    toast({ title: "User Deleted", description: `User ${emailToDelete} has been removed.` });
  };
  
  const getRoleIcon = (userType) => {
    switch (userType) {
      case 'customer': return <ShoppingBag className="h-5 w-5 text-blue-500" />;
      case 'housewife': return <ChefHat className="h-5 w-5 text-green-500" />;
      case 'vendor': return <Package className="h-5 w-5 text-purple-500" />;
      case 'deliveryPartner': return <Bike className="h-5 w-5 text-teal-500" />;
      case 'admin': return <Settings className="h-5 w-5 text-gray-600" />;
      default: return <Users className="h-5 w-5 text-gray-400" />;
    }
  };


  return (
    <div className="min-h-[calc(100vh-13rem)] bg-gradient-to-br from-gray-200 via-slate-200 to-stone-200 p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto"
      >
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800">Admin Control Panel</h1>
          <p className="text-xl text-gray-600 mt-2">Oversee and manage Dabba Delight operations.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="text-blue-500"/>} />
          <StatCard title="Customers" value={stats.customers} icon={<ShoppingBag className="text-orange-500"/>} />
          <StatCard title="Housewives" value={stats.housewives} icon={<ChefHat className="text-green-500"/>} />
          <StatCard title="Vendors" value={stats.vendors} icon={<Package className="text-purple-500"/>} />
          <StatCard title="Delivery Partners" value={stats.deliveryPartners} icon={<Bike className="text-teal-500"/>} />
          <StatCard title="Admins" value={stats.admins} icon={<Settings className="text-gray-600"/>} />
          <StatCard title="Material Requests" value={stats.totalRequests} icon={<BarChart3 className="text-indigo-500"/>} />
          <StatCard title="Pending Requests" value={stats.pendingRequests} icon={<AlertTriangle className="text-yellow-500"/>} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-700"><Users className="mr-2"/>User Management</CardTitle>
              <CardDescription>View and manage all registered users.</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto">
              {allUsers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.map((u) => (
                      <TableRow key={u.email}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell className="capitalize flex items-center gap-2">
                          {getRoleIcon(u.userType)} {u.userType}
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" disabled={u.email === user.email}>
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the user account
                                  and remove their data from the platform.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(u.email)}>
                                  Continue
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <p className="text-gray-600">No users found.</p>}
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-700"><BarChart3 className="mr-2"/>Material Request Overview</CardTitle>
              <CardDescription>Monitor material requests across the platform.</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto">
              {allRequests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Housewife</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allRequests.map((req) => (
                       <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.housewifeName || req.housewifeEmail}</TableCell>
                        <TableCell className="text-xs">{req.items.join(', ')}</TableCell>
                        <TableCell className="text-xs">{new Date(req.timestamp).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            req.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' : 
                            req.status === 'Processed' ? 'bg-blue-200 text-blue-800' :
                            req.status === 'Out for Delivery' ? 'bg-purple-200 text-purple-800' :
                            req.status === 'Delivered' ? 'bg-green-200 text-green-800' :
                            'bg-gray-200 text-gray-800'
                          }`}>{req.status}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <p className="text-gray-600">No material requests found.</p>}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
    </CardContent>
  </Card>
);

export default AdminDashboard;