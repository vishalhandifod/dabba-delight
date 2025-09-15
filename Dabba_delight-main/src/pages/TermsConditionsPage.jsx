import React from 'react';
import { motion } from 'framer-motion';

const TermsConditionsPage = () => (
  <div className="bg-yellow-50 py-16 md:py-24 min-h-[calc(100vh-13rem)]">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.h1 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-5xl font-extrabold text-center text-orange-600 mb-12"
      >
        Terms & Conditions
      </motion.h1>
      
      <motion.div 
        className="prose prose-lg max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-xl shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <p className="text-gray-500 text-sm mb-6">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold text-orange-500">1. Introduction</h2>
        <p>Welcome to Dabba Delight! These terms and conditions outline the rules and regulations for the use of Dabba Delight's Website, located at [YourWebsiteURL.com]. By accessing this website we assume you accept these terms and conditions. Do not continue to use Dabba Delight if you do not agree to take all of the terms and conditions stated on this page.</p>

        <h2 className="text-2xl font-semibold text-orange-500 mt-6">2. Intellectual Property Rights</h2>
        <p>Other than the content you own, under these Terms, Dabba Delight and/or its licensors own all the intellectual property rights and materials contained in this Website. You are granted limited license only for purposes of viewing the material contained on this Website.</p>

        <h2 className="text-2xl font-semibold text-orange-500 mt-6">3. Restrictions</h2>
        <p>You are specifically restricted from all of the following:</p>
        <ul className="list-disc list-inside space-y-1 pl-4">
          <li>Publishing any Website material in any other media.</li>
          <li>Selling, sublicensing and/or otherwise commercializing any Website material.</li>
          <li>Publicly performing and/or showing any Website material.</li>
          <li>Using this Website in any way that is or may be damaging to this Website.</li>
          <li>Using this Website in any way that impacts user access to this Website.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-orange-500 mt-6">4. Orders and Payments</h2>
        <p>All orders are subject to availability and confirmation of the order price. Delivery times may vary according to availability and any guarantees or representations made as to delivery times are subject to any delays resulting from postal delays or force majeure for which we will not be responsible.</p>

        <h2 className="text-2xl font-semibold text-orange-500 mt-6">5. Limitation of Liability</h2>
        <p>In no event shall Dabba Delight, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. Dabba Delight, including its officers, directors and employees shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this Website.</p>
        
        <h2 className="text-2xl font-semibold text-orange-500 mt-6">6. Governing Law & Jurisdiction</h2>
        <p>These Terms will be governed by and interpreted in accordance with the laws of India, and you submit to the non-exclusive jurisdiction of the state and federal courts located in India for the resolution of any disputes.</p>
      </motion.div>
    </div>
  </div>
);

export default TermsConditionsPage;