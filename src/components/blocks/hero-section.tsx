'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight, Star, Shield, Truck, HeadphonesIcon } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-800 dark:via-blue-900 dark:to-indigo-950 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-10 -right-10 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2"
              >
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">Trusted by 10,000+ customers</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-4xl lg:text-6xl font-bold leading-tight"
              >
                Uganda's Premier{' '}
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Technology
                </span>{' '}
                Marketplace
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-xl lg:text-2xl text-blue-100 max-w-xl"
              >
                Discover cutting-edge laptops, smartphones, gaming gear, and electronics at unbeatable prices. 
                Fast delivery across Uganda.
              </motion.p>
            </div>
            
            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="relative max-w-md"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search for products..."
                  className="pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm border-0 rounded-xl text-gray-900 placeholder-gray-500"
                />
              </div>
              <Button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 rounded-lg px-6"
              >
                Search
              </Button>
            </motion.div>
            
            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 group"
                asChild
              >
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
                asChild
              >
                <Link href="/categories">
                  Browse Categories
                </Link>
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Right Content - Hero Image/Features */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <Shield className="w-8 h-8 text-green-400 mb-3" />
                <h3 className="font-semibold mb-2">Secure Shopping</h3>
                <p className="text-sm text-blue-100">Protected payments & buyer guarantee</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <Truck className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="font-semibold mb-2">Fast Delivery</h3>
                <p className="text-sm text-blue-100">Same-day delivery in Kampala</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <HeadphonesIcon className="w-8 h-8 text-purple-400 mb-3" />
                <h3 className="font-semibold mb-2">24/7 Support</h3>
                <p className="text-sm text-blue-100">Expert customer service</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <Star className="w-8 h-8 text-yellow-400 mb-3" />
                <h3 className="font-semibold mb-2">Best Prices</h3>
                <p className="text-sm text-blue-100">Price match guarantee</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
        
        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-white/20"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">10,000+</div>
            <div className="text-blue-100">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">500+</div>
            <div className="text-blue-100">Products</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">50+</div>
            <div className="text-blue-100">Top Brands</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400">24/7</div>
            <div className="text-blue-100">Support</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}