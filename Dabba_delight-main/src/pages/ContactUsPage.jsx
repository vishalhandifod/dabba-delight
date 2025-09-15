import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageSquare, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ContactUsPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = React.useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Incomplete Form",
        description: "Please fill all fields.",
        variant: "destructive",
      });
      return;
    }
    
    const contactMessage = { ...formData, submittedAt: new Date().toISOString() };
    localStorage.setItem(`contactMessage_${Date.now()}`, JSON.stringify(contactMessage));

    toast({
      title: "Message Sent!",
      description: "We'll get back to you soon.",
    });
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="bg-orange-50 py-16 md:py-24 min-h-[calc(100vh-13rem)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-5xl font-extrabold text-center text-orange-600 mb-8"
        >
          Get In Touch
        </motion.h1>
        <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto text-center mb-12">
          Have questions, suggestions, or just want to say hello? We'd love to hear from you!
        </p>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <motion.div 
            className="bg-white p-8 sm:p-10 rounded-xl shadow-xl"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="mb-1">Full Name</Label>
                <Input type="text" name="name" id="name" value={formData.name} onChange={handleChange} placeholder="Your Name"/>
              </div>
              <div>
                <Label htmlFor="email" className="mb-1">Email</Label>
                <Input type="email" name="email" id="email" value={formData.email} onChange={handleChange} placeholder="you@example.com"/>
              </div>
              <div>
                <Label htmlFor="subject" className="mb-1">Subject</Label>
                <Input type="text" name="subject" id="subject" value={formData.subject} onChange={handleChange} placeholder="Reason for contacting"/>
              </div>
              <div>
                <Label htmlFor="message" className="mb-1">Message</Label>
                <textarea name="message" id="message" rows="5" value={formData.message} onChange={handleChange} className="w-full px-4 py-2.5 border border-input bg-background rounded-lg focus:ring-ring focus:border-ring transition-colors" placeholder="Your message..."></textarea>
              </div>
              <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:opacity-90 text-white font-bold py-3.5 rounded-lg shadow-md transform hover:scale-102 transition-transform">
                Send Message
              </Button>
            </form>
          </motion.div>

          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-white p-8 rounded-xl shadow-xl">
              <h3 className="text-2xl font-semibold text-orange-600 mb-4 flex items-center"><Phone className="mr-3 text-orange-500" /> Phone</h3>
              <p className="text-gray-700 text-lg hover:text-orange-500 transition-colors"><a href="tel:+1234567890">(123) 456-7890</a></p>
              <p className="text-sm text-gray-500">Mon - Sat, 9 AM - 7 PM</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-xl">
              <h3 className="text-2xl font-semibold text-orange-600 mb-4 flex items-center"><MessageSquare className="mr-3 text-orange-500" /> Email</h3>
              <p className="text-gray-700 text-lg hover:text-orange-500 transition-colors"><a href="mailto:info@dabbadelight.com">info@dabbadelight.com</a></p>
              <p className="text-sm text-gray-500">We reply within 24 hours</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-xl">
              <h3 className="text-2xl font-semibold text-orange-600 mb-4 flex items-center"><Home className="mr-3 text-orange-500" /> Address</h3>
              <p className="text-gray-700 text-lg">123 Foodie Lane, Flavor Town, FT 54321</p>
              <p className="text-sm text-gray-500">Come say hi (by appointment)!</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;