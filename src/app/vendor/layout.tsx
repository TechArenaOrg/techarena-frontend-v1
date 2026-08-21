import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { VendorSidebar } from '@/components/vendor/VendorSidebar';

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
    <div className="flex-1 flex">
      <VendorSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
