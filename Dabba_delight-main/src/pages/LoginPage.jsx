import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/useAuth.jsx';
import { Utensils, User, Phone, Mail } from 'lucide-react';
import api from '@/lib/api';
// import * as jwtDecode from 'jwt-decode';


const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = React.useState('phone'); // 'phone' or 'email'
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [otpSent, setOtpSent] = React.useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const username = loginMethod === 'phone' ? phone : email;
      await api.post('/auth/request-otp', { username });
      setOtpSent(true);
      toast({
        title: 'OTP Sent',
        description: 'We have sent an OTP to your ' + loginMethod,
      });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        navigate('/signup', { state: { [loginMethod]: loginMethod === 'phone' ? phone : email } });
      } else {
        toast({
          title: 'Error sending OTP',
          description: error.message || 'An error occurred.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const username = loginMethod === "phone" ? phone : email;
      const response = await api.post("/auth/verify-otp", { username, otp });
      const token = response.data;

      login(token);

      

      navigate("/menus");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast({
          title: "Invalid OTP",
          description: "The OTP you entered is incorrect.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error logging in",
          description: error.message || "An error occurred.",
          variant: "destructive",
        });
      }
    }
  };


  const toggleLoginMethod = () => {
    setLoginMethod(loginMethod === 'phone' ? 'email' : 'phone');
    setPhone('');
    setEmail('');
    setOtp('');
    setOtpSent(false);
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
                  />
                </div>
              )}
              <Button
                type="button"
                variant="link"
                className="text-orange-600 hover:text-orange-500 text-sm mt-2"
                onClick={toggleLoginMethod}
              >
                Use {loginMethod === 'phone' ? 'Email' : 'Phone'} instead
              </Button>
            </div>
          ) : (
            <div>
              <Label htmlFor="otp" className="flex items-center text-gray-700 font-medium mb-1">
                <User className="h-5 w-5 mr-2 text-orange-500" />
                Enter OTP
              </Label>
              <Input
                id="otp"
                name="otp"
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="One-Time Password"
              />
            </div>
          )}

          <div>
            <Button
              type="submit"
              size="lg"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transform transition-transform hover:scale-102"
            >
              {otpSent ? 'Verify OTP' : 'Send OTP'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;