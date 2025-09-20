import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/useAuth.jsx';
import { Utensils, User, Phone, Mail } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = React.useState('phone'); // 'phone' or 'email'
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [otpSent, setOtpSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const username = loginMethod === 'phone' ? phone : email;
      await api.post('/auth/request-otp', { username });
      setOtpSent(true);
      toast.success(`OTP sent to your ${loginMethod}`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        navigate('/signup', { 
          state: { [loginMethod]: loginMethod === 'phone' ? phone : email } 
        });
      } else {
        toast.error(error.response?.data?.message || error.message || 'Error sending OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const username = loginMethod === "phone" ? phone : email;
      
      // Step 1: Verify OTP and get token (this should set the cookie in backend)
      const response = await api.post("/auth/verify-otp", { username, otp });
      
      // If your backend returns a token in response, you might need to handle it
      // But if it sets an HttpOnly cookie, we can proceed directly to login
      
      // Step 2: Call the login function from useAuth to fetch user data
      await login();
      
      toast.success('Login successful!');
      navigate("/");
      
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response && error.response.status === 400) {
        toast.error('Invalid OTP. Please check and try again.');
      } else if (error.message?.includes('Unable to fetch user data')) {
        // This means OTP verification passed but fetching user data failed
        toast.error('Login successful but failed to load profile. Please try refreshing.');
        navigate("/menus"); // Still navigate as login was successful
      } else {
        toast.error(error.response?.data?.message || error.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleLoginMethod = () => {
    setLoginMethod(loginMethod === 'phone' ? 'email' : 'phone');
    setPhone('');
    setEmail('');
    setOtp('');
    setOtpSent(false);
  };

  const handleBack = () => {
    setOtpSent(false);
    setOtp('');
  };

  // Show loading if auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-13rem)] bg-gradient-to-br from-yellow-200 via-orange-200 to-red-200 flex items-center justify-center">
        <div className="text-center">
          <Utensils className="mx-auto h-16 w-auto text-orange-500 animate-pulse" />
          <p className="mt-4 text-lg text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

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
            Sign in to Dabba Delight
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/signup" className="font-medium text-orange-600 hover:text-orange-500">
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={otpSent ? handleLogin : handleSendOtp}>
          {!otpSent ? (
            <div>
              {loginMethod === 'phone' ? (
                <div>
                  <Label htmlFor="phone-number" className="flex items-center text-gray-700 font-medium mb-1">
                    <Phone className="h-5 w-5 mr-2 text-orange-500" />
                    Phone number
                  </Label>
                  <Input
                    id="phone-number"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="appearance-none rounded-md relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                    placeholder="Phone number"
                    disabled={loading}
                  />
                </div>
              ) : (
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
                    disabled={loading}
                  />
                </div>
              )}
              <Button
                type="button"
                variant="link"
                className="text-orange-600 hover:text-orange-500 text-sm mt-2"
                onClick={toggleLoginMethod}
                disabled={loading}
              >
                Use {loginMethod === 'phone' ? 'Email' : 'Phone'} instead
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label htmlFor="otp" className="flex items-center text-gray-700 font-medium">
                  <User className="h-5 w-5 mr-2 text-orange-500" />
                  Enter OTP
                </Label>
                <Button
                  type="button"
                  variant="link"
                  className="text-orange-600 hover:text-orange-500 text-sm p-0"
                  onClick={handleBack}
                  disabled={loading}
                >
                  ← Back
                </Button>
              </div>
              <Input
                id="otp"
                name="otp"
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="One-Time Password"
                disabled={loading}
                maxLength={6}
              />
              <p className="mt-2 text-sm text-gray-600">
                OTP sent to your {loginMethod}: {loginMethod === 'phone' ? phone : email}
              </p>
            </div>
          )}

          <div>
            <Button
              type="submit"
              size="lg"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transform transition-transform hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {otpSent ? 'Verifying...' : 'Sending...'}
                </div>
              ) : (
                otpSent ? 'Verify OTP' : 'Send OTP'
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;