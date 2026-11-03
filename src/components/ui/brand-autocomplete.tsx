'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { productsAPI } from '@/services/api/products-api';
import { cn } from '@/lib/utils';

interface BrandAutocompleteProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

// Suggests existing brands (from products that already have one set) while still
// accepting anything typed - there's no backend-managed brand list to constrain this
// to, so it can't be a plain dropdown, but matching existing spelling avoids "Apple"
// and "apple" silently becoming two different brands.
export function BrandAutocomplete({ id, value, onChange, disabled, placeholder }: BrandAutocompleteProps) {
  const [brands, setBrands] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    productsAPI.getBrands().then(setBrands).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const trimmed = value.trim().toLowerCase();
  const matches = trimmed
    ? brands.filter((b) => b.toLowerCase().includes(trimmed) && b.toLowerCase() !== trimmed)
    : brands;

  const handleSelect = (brand: string) => {
    onChange(brand);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || matches.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % matches.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => (i - 1 + matches.length) % matches.length);
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(matches[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen && matches.length > 0}
      />
      {isOpen && matches.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-background shadow-md">
          {matches.map((brand, index) => (
            <button
              key={brand}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(brand)}
              className={cn(
                'w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted',
                index === highlightedIndex && 'bg-muted'
              )}
            >
              {brand}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
