import { redirect } from 'next/navigation';
import { auth } from '@/auth';

// Pure role router, reached right after a fresh Google sign-in/sign-up (credentials
// logins skip this and go straight to the right place, since the role is already known
// client-side by then). Nothing renders here - every role lands somewhere else.
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/login');
  }

  const role = (session.user as any).role;
  if (role === 'vendor') {
    redirect('/vendor/dashboard');
  }
  if (role === 'admin' || role === 'super_admin') {
    redirect('/admin/dashboard');
  }
  redirect('/');
}
