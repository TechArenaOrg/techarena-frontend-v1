'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Icons, type Icon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

export interface SectionNavItem {
  href: string;
  label: string;
  icon: Icon;
}

// The admin/vendor sidebar is `hidden md:block` with no mobile equivalent - below
// that breakpoint there's no way to navigate between sections at all. This is the
// fix: a sticky bar + slide-out drawer, same Sheet component the site header
// already uses for its own mobile menu, shown only below md so it never doubles
// up with the real sidebar.
export function MobileSectionNav({ items, label }: { items: SectionNavItem[]; label: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden sticky top-14 z-40 border-b bg-background px-4 py-2.5">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <Icons.menu className="mr-2 h-4 w-4" />
            {label} Menu
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px]">
          <SheetTitle>{label}</SheetTitle>
          <nav className="mt-6 space-y-1">
            {items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const ItemIcon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <ItemIcon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
