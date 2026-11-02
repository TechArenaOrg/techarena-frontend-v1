'use client';

import { useSession } from 'next-auth/react';
import { MobileSectionNav } from '@/components/ui/mobile-section-nav';
import { getAdminNavItems } from '@/components/admin/admin-nav-items';

// Same client-side role filtering as AdminSidebar, for the same reason - see there.
export function AdminMobileNav() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role ?? '';

  return <MobileSectionNav items={getAdminNavItems(role)} label="Admin" />;
}
