import Link from 'next/link';
import { Package, Calendar, CreditCard, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { formatCurrency } from '@/lib/utils';

interface OrderItemView {
  id: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
}

interface OrderView {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
  items: OrderItemView[];
}

interface OrdersListProps {
  orders: OrderView[];
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function getStatusIcon(status: string) {
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
}

function getStatusColor(status: string) {
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
}

export function OrdersList({ orders, currentPage, totalPages, hasNextPage, hasPreviousPage }: OrdersListProps) {
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
                      {order.createdAt.toLocaleDateString('en-UG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-4 h-4" />
                      {formatCurrency(order.totalAmount)}
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
                <div className="space-y-1">
                  {order.items.slice(0, 3).map((item) => (
                    <p key={item.id} className="text-sm text-gray-600 dark:text-gray-400">
                      {item.productName} · Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      and {order.items.length - 3} more items
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

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
          />
        </div>
      )}
    </div>
  );
}
