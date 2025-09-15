import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, UserCircle, History } from 'lucide-react';

const CustomerDashboard = () => {
  const user = JSON.parse(localStorage.getItem('dabbaDelightUser'));

  if (!user || user.userType !== 'customer') {
    return (
      <div className="min-h-[calc(100vh-13rem)] bg-yellow-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-10 rounded-lg shadow-xl"
        >
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700">You must be logged in as a customer to view this page.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-13rem)] bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto"
      >
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-orange-600">Welcome, {user.name || user.email}!</h1>
          <p className="text-xl text-gray-600 mt-2">Your Customer Dashboard</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all"
          >
            <ShoppingBag className="h-12 w-12 text-orange-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">My Orders</h2>
            <p className="text-gray-600 mb-4">View your current and past Dabba orders.</p>
            <button className="text-orange-600 font-semibold hover:underline">View Orders &rarr;</button>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all"
          >
            <UserCircle className="h-12 w-12 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Profile Settings</h2>
            <p className="text-gray-600 mb-4">Manage your account details and preferences.</p>
            <button className="text-yellow-600 font-semibold hover:underline">Edit Profile &rarr;</button>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all"
          >
            <History className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Subscription Plan</h2>
            <p className="text-gray-600 mb-4">Check your current subscription or explore new plans.</p>
            <button className="text-red-600 font-semibold hover:underline">Manage Subscription &rarr;</button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomerDashboard;