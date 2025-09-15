import React from 'react';
import { motion } from 'framer-motion';
import { Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const FeedbackPage = () => {
  const { toast } = useToast();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [feedback, setFeedback] = React.useState('');
  const [rating, setRating] = React.useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !feedback || rating === 0) {
      toast({
        title: "Incomplete Form",
        description: "Please fill all fields and provide a rating.",
        variant: "destructive",
      });
      return;
    }
    
    const feedbackData = { name, email, feedback, rating, submittedAt: new Date().toISOString() };
    localStorage.setItem(`feedback_${Date.now()}`, JSON.stringify(feedbackData));

    toast({
      title: "Feedback Submitted!",
      description: "Thank you for your valuable feedback.",
    });
    setName('');
    setEmail('');
    setFeedback('');
    setRating(0);
  };

  return (
    <div className="bg-yellow-50 py-16 md:py-24 min-h-[calc(100vh-13rem)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-5xl font-extrabold text-center text-orange-600 mb-8"
        >
          We Value Your Feedback
        </motion.h1>
        <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto text-center mb-12">
          Your opinions help us improve and serve you better. Please share your thoughts on our food and service.
        </p>

        <motion.form 
          onSubmit={handleSubmit} 
          className="max-w-2xl mx-auto bg-white p-8 sm:p-10 rounded-xl shadow-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="name" className="mb-1">Full Name</Label>
              <Input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ananya Singh"/>
            </div>
            <div>
              <Label htmlFor="email" className="mb-1">Email Address</Label>
              <Input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. ananya@example.com"/>
            </div>
          </div>
          <div className="mb-6">
            <Label htmlFor="feedback" className="mb-1">Your Feedback</Label>
            <textarea name="feedback" id="feedback" rows="5" value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full px-4 py-2.5 border border-input bg-background rounded-lg focus:ring-ring focus:border-ring transition-colors" placeholder="Tell us what you think..."></textarea>
          </div>
          <div className="mb-8">
            <Label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating</Label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-full transition-colors ${rating >= star ? 'bg-yellow-400 text-orange-700' : 'bg-gray-200 text-gray-500 hover:bg-yellow-200'}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Utensils className="h-6 w-6" />
                </motion.button>
              ))}
            </div>
          </div>
          <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3.5 rounded-lg shadow-md transform hover:scale-102 transition-transform">
            Submit Feedback
          </Button>
        </motion.form>
      </div>
    </div>
  );
};

export default FeedbackPage;