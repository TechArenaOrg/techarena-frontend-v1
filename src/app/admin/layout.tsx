import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminMobileNav } from '@/components/admin/AdminMobileNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/login');
  }

  const role = (session.user as any).role;
  if (role !== 'admin' && role !== 'super_admin') {
    redirect(role === 'vendor' || role === 'official_store_manager' ? '/vendor/dashboard' : '/dashboard');
  }

  return (
    <div className="flex-1 flex flex-col">
      <AdminMobileNav />
      <div className="flex-1 flex">
        <AdminSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
