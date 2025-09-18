import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Utensils, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth.jsx';

const HomePage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  console.log('Authenticated user:', session);

  // Debug function to check authentication
  const debugAuth = async () => {
    try {
      const response = await fetch('/api/users/me', {
        method: 'GET',
        credentials: 'include', // This includes the JWT_TOKEN cookie
        headers: { 
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Auth debug - Current user:', data);
        return data;
      } else {
        console.error('Auth debug failed:', response.status, response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Auth debug error:', error);
      return null;
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Since you're using cookie-based JWT, no need for Authorization header
      // The JWT_TOKEN cookie will be sent automatically with credentials: 'include'
      const response = await fetch('/api/users/all', {
        method: 'GET',
        credentials: 'include', // This sends the JWT_TOKEN cookie
        headers: { 
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          console.error('Access denied - insufficient permissions');
          console.log('User role:', session?.role);
          console.log('User roles array:', session?.roles);
          
          // Debug the actual authentication
          const authDebug = await debugAuth();
          if (authDebug) {
            console.log('Actual authorities from server:', authDebug.roles);
          }
          
          alert('Access denied: You need SUPERADMIN role to view all users');
        } else if (response.status === 401) {
          console.error('Unauthorized - please login again');
          alert('Please login again');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('User data from /api/users/all:', data);
      setUsers(data);
      alert(`Successfully fetched ${data.length} users!`);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test function to verify different endpoints
  const testEndpoints = async () => {
    console.log('=== Testing Endpoints ===');
    
    // Test /me endpoint
    const meResult = await debugAuth();
    
    // Test /all endpoint if user has SUPERADMIN role
    if (meResult && meResult.roles && 
        meResult.roles.some(role => role.authority === 'ROLE_SUPERADMIN')) {
      console.log('User has SUPERADMIN role, testing /all endpoint...');
      await fetchUserData();
    } else {
      console.log('User does not have SUPERADMIN role');
      console.log('Available roles:', meResult?.roles);
    }
  };

  useEffect(() => {
    if (session) {
      console.log('Session detected, testing endpoints...');
      testEndpoints();
    } else {
      console.log('No authenticated user found.');
    }
  }, [session]);

  return (
    <div className="bg-yellow-50 min-h-[calc(100vh-13rem)]">
      {/* Debug Panel for SUPERADMIN */}
      {/* {session && session.role === 'ROLE_SUPERADMIN' && (
        <div className="bg-blue-50 border border-blue-200 p-4 m-4 rounded">
          <h3 className="text-lg font-bold text-blue-800 mb-2">SUPERADMIN Debug Panel</h3>
          <p className="text-sm text-blue-600 mb-2">
            Logged in as: {session.name} ({session.role})
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={debugAuth} 
              size="sm" 
              variant="outline"
              className="border-blue-500 text-blue-600"
            >
              Debug Auth
            </Button>
            <Button 
              onClick={fetchUserData} 
              size="sm" 
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {loading ? 'Loading...' : 'Fetch All Users'}
            </Button>
          </div>
          
          {users.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <h4 className="font-semibold text-green-800">Users Found: {users.length}</h4>
              <ul className="text-sm text-green-700 mt-1">
                {users.slice(0, 5).map(user => (
                  <li key={user.id}>
                    {user.name} ({user.email}) - {user.role}
                  </li>
                ))}
                {users.length > 5 && <li>... and {users.length - 5} more</li>}
              </ul>
            </div>
          )}
        </div>
      )} */}

      <header className="relative py-20 md:py-32 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
          >
            Authentic Home-Cooked Meals
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto"
          >
            Delivered with love, from local kitchens to your table. Experience the taste of home, hassle-free.
          </motion.p>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-orange-800 font-bold text-lg px-10 py-4 rounded-full shadow-xl transform hover:scale-105 transition-transform">
              Order Your Dabba Today!
            </Button>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-20 bg-yellow-50" style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }}></div>
      </header>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-orange-600 mb-16">Why Choose Dabba Delight?</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: "Fresh & Nutritious", description: "Meals prepared daily with fresh, locally sourced ingredients.", icon: <Utensils className="h-12 w-12 text-orange-500" /> },
              { title: "Homely Taste", description: "Authentic recipes from talented home cooks in your community.", icon: <Home className="h-12 w-12 text-orange-500" /> },
              { title: "Convenient Delivery", description: "Reliable and friendly delivery service right to your doorstep.", icon: <Users className="h-12 w-12 text-orange-500" /> }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center"
              >
                <div className="p-4 bg-orange-100 rounded-full mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-orange-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-orange-600 mb-8">See Our Delicious Dabbas</h2>
          <p className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto">Each dabba is packed with care, offering a balanced and flavorful meal that reminds you of home.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="rounded-lg overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300">
              <img alt="Delicious North Indian Thali" className="w-full h-64 object-cover" src="https://images.unsplash.com/photo-1614218116116-436c7fe66c37" />
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="rounded-lg overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300">
              <img alt="Healthy South Indian Meal Box" className="w-full h-64 object-cover" src="https://images.unsplash.com/photo-1680359870490-d49895a285dd" />
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="rounded-lg overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300">
              <img alt="Comforting Home-style Lunch Box" className="w-full h-64 object-cover" src="https://images.unsplash.com/photo-1690951784638-1f9039d74a6c" />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-orange-600 mb-8">Join Our Community</h2>
          <p className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto">Become a Dabba Delight home cook or enjoy delicious meals. We're building a community around food and care.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg shadow-md transform hover:scale-105 transition-transform">
              Become a Home Cook
            </Button>
            <Button size="lg" variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-semibold px-8 py-3 rounded-lg shadow-md transform hover:scale-105 transition-transform" onClick={() => navigate('/products')}>
              Explore Meal Plans
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;