'use client';

import { Star, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Review } from '@/types';

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
}

export function ProductReviews({ productId, reviews }: ProductReviewsProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No reviews yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Be the first to review this product!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={review.user.profile?.avatarUrl} alt={`${review.user.profile?.firstName} ${review.user.profile?.lastName}`} />
                  <AvatarFallback>
                    {review.user.profile?.firstName?.[0]}{review.user.profile?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {review.user.profile?.firstName} {review.user.profile?.lastName}
                      </h4>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        {review.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString('en-UG')}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300">
                    {review.content}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}