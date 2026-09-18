import { Icons } from '@/components/ui/icons';

export default function Loading() {
  return (
    <main className="flex flex-1 items-center justify-center py-32">
      <Icons.spinner className="h-10 w-10 animate-spin text-primary" />
    </main>
  );
}
