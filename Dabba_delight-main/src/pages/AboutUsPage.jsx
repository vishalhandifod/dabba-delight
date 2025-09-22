import React from 'react';
import { motion } from 'framer-motion';

const ProfileCard = ({ name, role, bio, imageKey }) => (
  <motion.div 
    className="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform duration-300"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden border-4 border-orange-300">
      <img  alt={name} className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1586732711591-12c04655338f" />
    </div>
    <h3 className="text-2xl font-semibold text-orange-600 mb-1">{name}</h3>
    <p className="text-gray-500 font-medium mb-3">{role}</p>
    <p className="text-gray-700 text-sm leading-relaxed">{bio}</p>
  </motion.div>
);

const AboutUsPage = () => (
  <div className="bg-yellow-50 py-16 md:py-24 min-h-[calc(100vh-13rem)]">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="text-5xl font-extrabold text-center text-orange-600 mb-8">Our Story</h1>
        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto text-center mb-16">
          Dabba Delight was born from a simple idea: to connect those who love to cook with those who crave wholesome, home-cooked meals. In our fast-paced lives, finding time for nutritious food can be a challenge. We bridge this gap by empowering local home cooks, primarily housewives, and delivering their culinary magic to busy professionals and students.
        </p>
      </motion.div>

      <section className="mb-16">
        <h2 className="text-4xl font-bold text-center text-orange-500 mb-12">Meet Our Founders</h2>
        <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          <ProfileCard 
            name="Shubhangi Chavan " 
            role="Founder & CEO" 
            bio="Shubhangi, a passionate foodie and former tech professional, envisioned Dabba Delight to foster community and promote healthy eating. Her grandmother's recipes are the heart of many of our meals."
            imageKey="priya-sharma"
          />
          <ProfileCard 
            name="Naitik Asudani" 
            role="Co-Founder & COO" 
            bio="Naitik brings operational excellence to Dabba Delight. With a background in logistics, he ensures that every meal reaches you fresh and on time, maintaining our promise of quality and reliability."
            imageKey="rajesh-kumar"
          />
        </div>
      </section>
      
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <h2 className="text-4xl font-bold text-center text-orange-500 mb-8">Our Mission & Vision</h2>
        <div className="grid md:grid-cols-2 gap-10 text-gray-700 leading-relaxed">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold text-orange-600 mb-3">Our Mission</h3>
            <p>To provide access to fresh, nutritious, and affordable home-cooked meals while empowering local home cooks and fostering a sense of community through food.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold text-orange-600 mb-3">Our Vision</h3>
            <p>To be the leading platform for homemade food delivery, celebrated for our commitment to quality, health, community, and the authentic taste of home.</p>
          </div>
        </div>
      </motion.section>
    </div>
  </div>
);

export default AboutUsPage;
