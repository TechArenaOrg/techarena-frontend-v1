import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminSidebar, ADMIN_NAV_ITEMS } from '@/components/admin/AdminSidebar';
import { MobileSectionNav } from '@/components/ui/mobile-section-nav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/login');
  }

  const role = (session.user as any).role;
  if (role !== 'admin' && role !== 'super_admin') {
    redirect(role === 'vendor' ? '/vendor/dashboard' : '/dashboard');
  }

  return (
    <div className="flex-1 flex flex-col">
      <MobileSectionNav items={ADMIN_NAV_ITEMS} label="Admin" />
      <div className="flex-1 flex">
        <AdminSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
