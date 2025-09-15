import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Utensils, User, Mail, Phone } from 'lucide-react';
import api from '@/lib/api';

const SignupPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState(location.state?.email || '');
  const [phone, setPhone] = React.useState(location.state?.phone || '');
  const [loading, setLoading] = React.useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!name || !email || !phone) {
        toast({
          title: "Signup Failed",
          description: "Please fill in all fields.",
          variant: "destructive",
        });
        return;
      }

      const response = await api.post('/users', { name, email, phone, password: 'password', role: 'USER' });

      toast({
        title: "Signup Successful!",
        description: "Your account has been created. Please add an address.",
      });

      const username = email;
      await api.post('/auth/request-otp', { username });
      const otpResponse = await api.post('/auth/verify-otp', { username, otp: "000000" }); // Using a dummy OTP for auto-login
      const token = otpResponse.data;
      localStorage.setItem('dabba_delight_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      navigate(`/users/${response.data.id}/addresses`);
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: error.message || "An error occurred during signup.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-13rem)] bg-gradient-to-br from-yellow-200 via-orange-200 to-red-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <Utensils className="mx-auto h-16 w-auto text-orange-500" />
          <h1 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div>
            <Label htmlFor="name" className="flex items-center text-gray-700 font-medium mb-1">
              <User className="h-5 w-5 mr-2 text-orange-500" />
              Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
              placeholder="Name"
            />
          </div>

          <div>
            <Label htmlFor="email-address" className="flex items-center text-gray-700 font-medium mb-1">
              <Mail className="h-5 w-5 mr-2 text-orange-500" />
              Email address
            </Label>
            <Input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="flex items-center text-gray-700 font-medium mb-1">
              <Phone className="h-5 w-5 mr-2 text-orange-500" />
              Phone
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
              placeholder="Phone"
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transform transition-transform hover:scale-102"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SignupPage;