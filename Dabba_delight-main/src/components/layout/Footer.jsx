import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-800 text-white py-12">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <p className="font-bold text-lg text-orange-400">Dabba Delight</p>
        <p className="mt-2 text-sm text-gray-300">Fresh, homemade meals delivered to your doorstep. Connecting communities, one dabba at a time.</p>
      </div>
      <div>
        <p className="font-bold text-lg text-orange-400">Quick Links</p>
        <ul className="mt-2 space-y-1">
          <li><Link to="/about" className="text-sm text-gray-300 hover:text-orange-400 transition-colors">About Us</Link></li>
          <li><Link to="/products" className="text-sm text-gray-300 hover:text-orange-400 transition-colors">Our Meals</Link></li>
          <li><Link to="/contact" className="text-sm text-gray-300 hover:text-orange-400 transition-colors">Contact</Link></li>
          <li><Link to="/terms" className="text-sm text-gray-300 hover:text-orange-400 transition-colors">Terms & Conditions</Link></li>
        </ul>
      </div>
      <div>
        <p className="font-bold text-lg text-orange-400">Connect With Us</p>
        <p className="mt-2 text-sm text-gray-300">123 Foodie Lane, Flavor Town, FT 54321</p>
        <p className="text-sm text-gray-300">Email: info@dabbadelight.com</p>
        <p className="text-sm text-gray-300">Phone: (123) 456-7890</p>
      </div>
    </div>
    <div className="mt-8 border-t border-gray-700 pt-8 text-center">
      <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Dabba Delight. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;