'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { productsAPI } from '@/services/api/products-api';
import type { Product } from '@/types';

interface SearchAutocompleteProps {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
}

export function SearchAutocomplete({ className, inputClassName, placeholder = 'Search products...' }: SearchAutocompleteProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const { products } = await productsAPI.searchProducts(trimmed);
        setResults(products.slice(0, 6));
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goToResults = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsOpen(false);
    router.push(`/products?search=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      goToResults();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const showDropdown = isOpen && query.trim().length >= 2;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn('pl-8', inputClassName)}
      />
      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </div>
          ) : results.length > 0 ? (
            <>
              <ul className="max-h-80 overflow-y-auto divide-y">
                {results.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/product/${product.slug}`}
                      className="flex items-center gap-3 p-3 hover:bg-muted transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="relative h-10 w-10 shrink-0 rounded overflow-hidden bg-muted">
                        <Image src={product.images?.[0]?.url || '/placeholder.svg'} alt={product.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">UGX {product.price.toLocaleString()}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                onClick={goToResults}
                className="w-full border-t p-2.5 text-center text-sm font-medium text-primary hover:bg-muted transition-colors"
              >
                View all results for &quot;{query.trim()}&quot;
              </button>
            </>
          ) : (
            <div className="py-4 text-center text-sm text-muted-foreground">No products found.</div>
          )}
        </div>
      )}
    </div>
  );
}
