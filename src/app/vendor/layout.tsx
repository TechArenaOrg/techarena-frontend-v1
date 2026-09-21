import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { VendorSidebar, VENDOR_NAV_ITEMS } from '@/components/vendor/VendorSidebar';
import { MobileSectionNav } from '@/components/ui/mobile-section-nav';

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/login');
  }

  const role = (session.user as any).role;
  if (role !== 'vendor') {
    redirect(role === 'admin' || role === 'super_admin' ? '/admin/dashboard' : '/dashboard');
  }

  return (
    <div className="flex-1 flex flex-col">
      <MobileSectionNav items={VENDOR_NAV_ITEMS} label="Vendor" />
      <div className="flex-1 flex">
        <VendorSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
