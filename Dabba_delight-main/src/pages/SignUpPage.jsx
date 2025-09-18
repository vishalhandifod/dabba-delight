import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Utensils, User, Mail, Phone, Lock } from 'lucide-react';
import api from '@/lib/api';

const SignupPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState(location.state?.email || '');
  const [phone, setPhone] = React.useState(location.state?.phone || '');
  const [otp, setOtp] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [otpSent, setOtpSent] = React.useState(false);
  const [userId, setUserId] = React.useState(null);

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

      // Validate phone number format (10 digits)
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phone)) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter exactly 10 digits.",
          variant: "destructive",
        });
        return;
      }

      // Step 1: Create user account
      const response = await api.post('/users', { 
        name, 
        email, 
        phone, 
        password: 'password', // This should be a proper password in production
        role: 'USER' 
      });

      setUserId(response.data.id);

      // Step 2: Request OTP
      await api.post('/auth/request-otp', { username: email });

      setOtpSent(true);
      toast({
        title: "Account Created!",
        description: "Please check your phone/email for the OTP code.",
      });

    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Signup Failed",
        description: error.response?.data || error.message || "An error occurred during signup.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!otp || otp.length !== 6) {
        toast({
          title: "Invalid OTP",
          description: "Please enter the 6-digit OTP code.",
          variant: "destructive",
        });
        return;
      }

      // Step 3: Verify OTP (this will set the JWT cookie)
      await api.post('/auth/verify-otp', { 
        username: email, 
        otp: otp 
      }, {
        withCredentials: true // Important: This allows cookies to be set
      });

      toast({
        title: "Verification Successful!",
        description: "You are now logged in. Please add an address.",
      });

      // Navigate to address page
      navigate(`/users/${userId}/addresses`);

    } catch (error) {
      console.error('OTP verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.response?.data || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      await api.post('/auth/request-otp', { username: email });
      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your phone/email.",
      });
    } catch (error) {
      toast({
        title: "Failed to resend OTP",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (otpSent) {
    return (
      <div className="min-h-[calc(100vh-13rem)] bg-gradient-to-br from-yellow-200 via-orange-200 to-red-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <Lock className="mx-auto h-16 w-auto text-orange-500" />
            <h1 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
              Verify Your Account
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter the 6-digit code sent to {email}
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleOtpVerification}>
            <div>
              <Label htmlFor="otp" className="flex items-center text-gray-700 font-medium mb-1">
                <Lock className="h-5 w-5 mr-2 text-orange-500" />
                OTP Code
              </Label>
              <Input
                id="otp"
                name="otp"
                type="text"
                maxLength="6"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="appearance-none rounded-md relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
                placeholder="000000"
              />
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                size="lg"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transform transition-transform hover:scale-102"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>

              <Button
                type="button"
                onClick={resendOtp}
                variant="outline"
                size="lg"
                className="w-full"
              >
                Resend OTP
              </Button>
            </div>
          </form>
        </motion.div>
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
              placeholder="Full Name"
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
              Phone (10 digits)
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => {
                // Only allow digits and limit to 10
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setPhone(value);
              }}
              className="appearance-none rounded-md relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
              placeholder="1234567890"
              maxLength="10"
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