import { Metadata } from 'next';
import { auth } from '@/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TestEmailForm } from '@/components/admin/TestEmailForm';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Admin tools and configuration.',
};

export default async function AdminSettingsPage() {
  const session = await auth();

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Admin tools and configuration.</p>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Email Delivery</CardTitle>
            <CardDescription>
              Send a test email to verify the backend's email configuration is working.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TestEmailForm defaultEmail={session?.user?.email ?? undefined} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
