'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  avatar?: string;
  rating: number;
  comment: string;
  location: string;
  verified: boolean;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Nakato',
    role: 'Business Owner',
    company: 'Nakato Enterprises',
    avatar: '/images/testimonials/sarah-nakato.jpg',
    rating: 5,
    comment: 'TechArena has been my go-to store for all technology needs. Their laptops are authentic and the customer service is exceptional. I\'ve purchased over 10 devices for my team and never been disappointed.',
    location: 'Kampala, Uganda',
    verified: true
  },
  {
    id: '2',
    name: 'James Okello',
    role: 'Software Developer',
    company: 'Tech Solutions UG',
    avatar: '/images/testimonials/james-okello.jpg',
    rating: 5,
    comment: 'The quality of products here is outstanding! I bought my gaming setup from TechArena and it\'s been perfect. Fast delivery and competitive prices make this my favorite tech store.',
    location: 'Entebbe, Uganda',
    verified: true
  },
  {
    id: '3',
    name: 'Mary Achieng',
    role: 'Student',
    company: 'Makerere University',
    avatar: '/images/testimonials/mary-achieng.jpg',
    rating: 5,
    comment: 'As a university student, I needed an affordable but reliable laptop. TechArena offered the best prices and even helped me choose the right specifications for my studies. Highly recommend!',
    location: 'Kampala, Uganda',
    verified: true
  },
  {
    id: '4',
    name: 'David Mukasa',
    role: 'Entrepreneur',
    company: 'Mukasa Digital',
    avatar: '/images/testimonials/david-mukasa.jpg',
    rating: 4,
    comment: 'Great selection of smartphones and accessories. The staff is knowledgeable and helped me set up my new phone. The warranty service is also excellent. Will definitely shop here again.',
    location: 'Jinja, Uganda',
    verified: true
  },
  {
    id: '5',
    name: 'Grace Namuli',
    role: 'Teacher',
    company: 'St. Mary\'s Secondary School',
    avatar: '/images/testimonials/grace-namuli.jpg',
    rating: 5,
    comment: 'I purchased tablets for my classroom through TechArena. The bulk discount was amazing and the delivery was on time. My students love the devices and they\'ve greatly improved our lessons.',
    location: 'Mbarara, Uganda',
    verified: true
  },
  {
    id: '6',
    name: 'Robert Kiprotich',
    role: 'Photographer',
    company: 'Kiprotich Photography',
    avatar: '/images/testimonials/robert-kiprotich.jpg',
    rating: 5,
    comment: 'Professional camera equipment at unbeatable prices. TechArena helped me upgrade my entire photography setup. The quality is top-notch and their technical support is fantastic.',
    location: 'Mbale, Uganda',
    verified: true
  }
];

export function TestimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="relative">
      {/* Main Testimonial */}
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Quote Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Quote className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            {/* Rating */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center gap-1 mb-6"
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < currentTestimonial.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </motion.div>

            {/* Testimonial Text */}
            <motion.blockquote
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 italic leading-relaxed"
            >
              "{currentTestimonial.comment}"
            </motion.blockquote>

            {/* Author Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Avatar className="w-16 h-16">
                <AvatarImage
                  src={currentTestimonial.avatar}
                  alt={currentTestimonial.name}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
                  {currentTestimonial.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {currentTestimonial.name}
                  </h4>
                  {currentTestimonial.verified && (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentTestimonial.role}
                  {currentTestimonial.company && (
                    <span className="text-blue-600 dark:text-blue-400"> at {currentTestimonial.company}</span>
                  )}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {currentTestimonial.location}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevious}
          className="w-10 h-10 rounded-full p-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {/* Dots Indicator */}
        <div className="flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-blue-600 dark:bg-blue-500'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNext}
          className="w-10 h-10 rounded-full p-0"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-12 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">4.9/5</div>
          <div className="text-gray-600 dark:text-gray-400">Average Rating</div>
          <div className="flex justify-center gap-1 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">2,500+</div>
          <div className="text-gray-600 dark:text-gray-400">Happy Customers</div>
          <div className="text-sm text-gray-500 dark:text-gray-500 mt-2">Across Uganda</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">98%</div>
          <div className="text-gray-600 dark:text-gray-400">Satisfaction Rate</div>
          <div className="text-sm text-gray-500 dark:text-gray-500 mt-2">Customer Reviews</div>
        </div>
      </motion.div>
    </div>
  );
}