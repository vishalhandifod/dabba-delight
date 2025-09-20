import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Utensils, Users, Menu as MenuIcon, X, ShoppingCart, LogOut, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/useAuth.jsx';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const location = useLocation();
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter navigation links based on user role
  const getFilteredNavLinks = () => {
    const allNavLinks = [
      { name: 'Home', path: '/', icon: Home },
      { name: 'About Us', path: '/about', icon: Users },
      { name: 'Menu', path: '/products', icon: MenuIcon },
      { name: 'Add Menu', path: '/menus', icon: MenuIcon, adminOnly: true }, // Mark as admin only
      { name: 'Users', path: '/userlist', icon: Users, adminOnly: true }, // Mark as admin only
      { name: 'Orders', path: '/orders', icon: ShoppingCart },
    ];
  if (!session) {
    return allNavLinks.filter(link => !link.adminOnly && !link.protectedOnly);
  }

    // If user role is 'USER', filter out admin-only links
    if (session?.role === 'ROLE_USER') {
      return allNavLinks.filter(link => !link.adminOnly);
    }

    // For admin users or other roles, show all links
    return allNavLinks;
  };

  const navLinks = getFilteredNavLinks();

  return (
    <nav className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Utensils className="h-10 w-10 text-white" />
            <span className="text-3xl font-bold text-white tracking-tight">Dabba Delight</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Button
                key={link.name}
                variant={location.pathname === link.path ? 'secondary' : 'ghost'}
                asChild
                className={`text-white hover:bg-white/20 ${location.pathname === link.path ? 'bg-white/30 font-semibold' : ''}`}
              >
                <Link to={link.path} className="flex items-center space-x-1 px-3 py-2 rounded-md">
                  <link.icon className="h-5 w-5" />
                  <span>{link.name}</span>
                </Link>
              </Button>
            ))}

            {/* Session-based */}
            {session ? (
              <div className="relative">
                <Button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  variant="ghost"
                  className="text-white hover:bg-white/20 flex items-center space-x-1 px-3 py-2 rounded-md"
                >
                  <User className="h-5 w-5" />
                  <span>{session.name || 'Account'}</span>
                </Button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-50">
                    <Link
                      to="/profile"
                      className=" px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </Link>

                    {/* Only show Orders for USER role */}
                    {session.role === 'ROLE_USER' && (
                      <Link
                        to="/orders"
                        className=" px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>My Orders</span>
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left  px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant={location.pathname === '/login' ? 'secondary' : 'ghost'}
                asChild
                className={`text-white hover:bg-white/20 ${location.pathname === '/login' ? 'bg-white/30 font-semibold' : ''}`}
              >
                <Link to="/login" className="flex items-center space-x-1 px-3 py-2 rounded-md">
                  <Users className="h-5 w-5" />
                  <span>Log-in</span>
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              onClick={() => setIsOpen(!isOpen)}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              {isOpen ? <X className="h-8 w-8" /> : <MenuIcon className="h-8 w-8" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/10 rounded-lg mt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-white hover:bg-white/20 ${
                    location.pathname === link.path ? 'bg-white/30 font-semibold' : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.name}</span>
                </Link>
              ))}

              {session ? (
                <div className="border-t border-white/20 pt-2 mt-2">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-white hover:bg-white/20"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Edit Profile</span>
                  </Link>

                  {session.role === 'USER' && (
                    <Link
                      to="/orders"
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-white hover:bg-white/20"
                      onClick={() => setIsOpen(false)}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span>My Orders</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full text-left flex items-center space-x-2 px-3 py-2 rounded-md text-white hover:bg-white/20"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-white hover:bg-white/20 ${
                    location.pathname === '/login' ? 'bg-white/30 font-semibold' : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Users className="h-5 w-5" />
                  <span>Log-in</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
