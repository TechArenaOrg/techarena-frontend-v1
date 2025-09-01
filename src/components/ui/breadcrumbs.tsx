'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  homeIcon?: boolean;
}

export function Breadcrumbs({ items, className, homeIcon = true }: BreadcrumbsProps) {
  return (
    <nav className={cn('flex', className)} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {homeIcon && (
          <>
            <li className="inline-flex items-center">
              <Link
                href="/"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </li>
            {items.length > 1 && (
              <li>
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </li>
            )}
          </>
        )}
        
        {items.slice(homeIcon ? 1 : 0).map((item, index) => {
          const isLast = index === items.slice(homeIcon ? 1 : 0).length - 1;
          
          return (
            <li key={item.href} className="inline-flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mr-1 md:mr-3" />
              )}
              
              {isLast || item.isCurrentPage ? (
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 dark:text-gray-400 dark:hover:text-white"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}