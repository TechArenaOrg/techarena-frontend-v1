'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Check, Gift, Zap, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to subscribe.",
        variant: "destructive"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubscribed(true);
      setEmail('');
      
      toast({
        title: "Successfully subscribed! 🎉",
        description: "Welcome to TechArena! You'll receive the latest deals and tech news.",
      });
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "Something went wrong. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl mx-auto"
      >
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold mb-4">
          Welcome to the TechArena Family! 🎉
        </h2>
        
        <p className="text-blue-100 text-lg mb-6">
          You're now subscribed to our newsletter. Get ready for exclusive deals, 
          tech insights, and early access to new products!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <Gift className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Exclusive Deals</h3>
            <p className="text-sm text-blue-100">Get early access to sales and special promotions</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <Zap className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">New Arrivals</h3>
            <p className="text-sm text-blue-100">Be the first to know about latest tech products</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <Bell className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Tech News</h3>
            <p className="text-sm text-blue-100">Stay updated with technology trends and tips</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="text-center max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Newsletter Icon */}
        <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-white" />
        </div>

        {/* Heading */}
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
          Stay Updated with TechArena
        </h2>
        
        {/* Description */}
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Get exclusive deals, new product announcements, and tech insights delivered straight to your inbox. 
          Join over 5,000 tech enthusiasts in Uganda!
        </p>

        {/* Newsletter Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md mx-auto mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/95 backdrop-blur-sm border-0 text-gray-900 placeholder-gray-500 h-12"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 px-8 h-12"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Subscribing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Subscribe
                  <Send className="w-4 h-4" />
                </div>
              )}
            </Button>
          </div>
        </motion.form>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <Gift className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Exclusive Deals</h3>
            <p className="text-blue-100">
              Get access to member-only discounts and flash sales before anyone else.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <Zap className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">New Product Alerts</h3>
            <p className="text-blue-100">
              Be the first to know when we add new gadgets and tech products to our store.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <Bell className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Tech Tips & News</h3>
            <p className="text-blue-100">
              Receive weekly tech insights, buying guides, and industry news from Uganda.
            </p>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 text-blue-100"
        >
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <span>No spam, ever</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <span>Unsubscribe anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <span>5,000+ subscribers</span>
          </div>
        </motion.div>

        {/* Privacy Notice */}
        <p className="text-sm text-blue-200 mt-4 max-w-md mx-auto">
          By subscribing, you agree to our Privacy Policy and Terms of Service. 
          We respect your privacy and will never share your email address.
        </p>
      </motion.div>
    </div>
  );
}