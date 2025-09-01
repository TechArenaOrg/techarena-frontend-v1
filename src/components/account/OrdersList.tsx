'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Calendar, CreditCard, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Order } from '@/types';
import { mockAPI } from '@/services/api/mock-endpoints';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface OrdersListProps {
  searchParams: {
    status?: string;
    page?: string;
  };
}

export function OrdersList({ searchParams }: OrdersListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = {
          status: searchParams.status,
          page: searchParams.page ? Number(searchParams.page) : 1,
          limit: 10,
        };

        const result = await mockAPI.orders.getOrders(params);
        setOrders(result.orders);
        setPagination({
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalCount: result.totalCount,
        });
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [searchParams]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No orders found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You haven't placed any orders yet.
        </p>
        <Button asChild>
          <Link href="/products">
            Start Shopping
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(order.status)}
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Order #{order.orderNumber}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(order.createdAt).toLocaleDateString('en-UG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-4 h-4" />
                      UGX {order.totalAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Items ({order.items.length})
                </h4>
                <div className="space-y-2">
                  {order.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        <img
                          src={item.product?.images?.[0]?.url || '/placeholder.jpg'}
                          alt={item.product?.name || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                          {item.product?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Qty: {item.quantity} × UGX {item.unitPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      and {order.items.length - 2} more items
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/account/orders/${order.id}`}>
                    View Details
                  </Link>
                </Button>
                {order.status === 'delivered' && (
                  <Button variant="outline" size="sm">
                    Leave Review
                  </Button>
                )}
                {['processing', 'shipped'].includes(order.status) && (
                  <Button variant="outline" size="sm">
                    Track Order
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={pagination.currentPage <= 1}
              asChild={pagination.currentPage > 1}
            >
              {pagination.currentPage > 1 ? (
                <Link href={`/account/orders?page=${pagination.currentPage - 1}`}>
                  Previous
                </Link>
              ) : (
                <span>Previous</span>
              )}
            </Button>
            
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              disabled={pagination.currentPage >= pagination.totalPages}
              asChild={pagination.currentPage < pagination.totalPages}
            >
              {pagination.currentPage < pagination.totalPages ? (
                <Link href={`/account/orders?page=${pagination.currentPage + 1}`}>
                  Next
                </Link>
              ) : (
                <span>Next</span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}