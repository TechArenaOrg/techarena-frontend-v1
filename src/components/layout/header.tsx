'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserMenu } from '@/components/auth/user-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SearchAutocomplete } from '@/components/layout/SearchAutocomplete';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';

const navigationItems = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'Categories', href: '/categories' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export function Header() {
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo - wordmark hidden on narrow phones, where the full row (logo + search +
            5 icons) doesn't fit no matter how small the search box shrinks. */}
        <Link href="/" className="mr-3 sm:mr-6 flex items-center space-x-2 shrink-0">
          <Image src="/logo.jpg" alt="TechArena" width={36} height={36} className="rounded-md" priority />
          <span className="font-bold text-xl hidden sm:inline">TechArena</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-between space-x-2 lg:justify-end">
          {/* Search */}
          <SearchAutocomplete
            className="w-full min-w-[80px] flex-1 lg:w-auto lg:flex-none"
            inputClassName="w-full rounded-lg bg-background lg:w-[200px] xl:w-[300px]"
          />

          <div className="flex items-center space-x-2 shrink-0">
            {/* Wishlist - hidden below sm, where the full row doesn't fit with it
                included; still reachable from the mobile menu drawer. */}
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex" asChild>
              <Link href="/account/wishlist">
                <div className="relative">
                  <Heart className="h-5 w-5" />
                  {wishlistItems.length > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs"
                    >
                      {wishlistItems.length}
                    </Badge>
                  )}
                </div>
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart">
                <div className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs"
                    >
                      {cartItemsCount}
                    </Badge>
                  )}
                </div>
              </Link>
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            <UserMenu />

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetTitle>Menu</SheetTitle>
                <nav className="flex flex-col space-y-4 mt-6">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium transition-colors hover:text-primary"
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Link
                    href="/account/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="sm:hidden flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
                  >
                    <Heart className="h-4 w-4" />
                    Wishlist{wishlistItems.length > 0 ? ` (${wishlistItems.length})` : ''}
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}