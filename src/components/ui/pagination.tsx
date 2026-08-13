'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  className?: string;
  // Lets two independent paginated sections coexist on one page (e.g. the homepage's
  // featured products and featured categories) without both fighting over `?page=`.
  paramName?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  className,
  paramName = 'page',
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageURL = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set(paramName, page.toString());
    return `${pathname}?${params.toString()}`;
  };

  const generatePageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show ellipsis logic
      if (currentPage <= 4) {
        // Show 1,2,3,4,5...n
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Show 1...n-4,n-3,n-2,n-1,n
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show 1...current-1,current,current+1...n
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  const pages = generatePageNumbers();

  return (
    <nav className={cn('flex items-center justify-center', className)}>
      <div className="flex items-center space-x-1">
        {/* Previous Button */}
        {hasPreviousPage ? (
          <Button asChild variant="outline" size="sm">
            <Link href={createPageURL(currentPage - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
        )}

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {pages.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <div
                  key={`ellipsis-${index}`}
                  className="flex h-9 w-9 items-center justify-center"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              );
            }

            const pageNumber = page as number;
            const isCurrentPage = pageNumber === currentPage;

            return isCurrentPage ? (
              <Button
                key={pageNumber}
                variant="default"
                size="sm"
                className="w-9 h-9 p-0"
              >
                {pageNumber}
              </Button>
            ) : (
              <Button
                key={pageNumber}
                asChild
                variant="outline"
                size="sm"
                className="w-9 h-9 p-0"
              >
                <Link href={createPageURL(pageNumber)}>
                  {pageNumber}
                </Link>
              </Button>
            );
          })}
        </div>

        {/* Next Button */}
        {hasNextPage ? (
          <Button asChild variant="outline" size="sm">
            <Link href={createPageURL(currentPage + 1)}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Page Info */}
      <div className="ml-4 hidden sm:block text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
    </nav>
  );
}