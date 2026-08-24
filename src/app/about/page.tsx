import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About Us',
  description: `Learn more about ${APP_NAME}, Uganda's technology marketplace.`,
};

const VALUES = [
  { icon: 'shield' as const, title: 'Secure Shopping', description: 'Every order is protected, from browsing to delivery.' },
  { icon: 'truck' as const, title: 'Fast Delivery', description: 'Same-day delivery across Kampala, nationwide beyond.' },
  { icon: 'store' as const, title: 'Verified Vendors', description: 'Every vendor on our platform is reviewed and approved.' },
  { icon: 'shoppingCart' as const, title: 'Real Value', description: "Competitive pricing on the products you actually want." },
];

export default function AboutPage() {
  return (
    <main className="flex-1">
      <div className="container py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-4">About {APP_NAME}</h1>
          <p className="text-lg text-muted-foreground">
            Uganda's technology marketplace, connecting shoppers with trusted vendors selling laptops,
            smartphones, gaming gear, and electronics.
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none mb-12">
          <p className="text-muted-foreground">
            {APP_NAME} was built to make buying technology in Uganda simple and reliable. Instead of
            navigating scattered listings and unverified sellers, shoppers get one place to browse real
            products from vetted vendors, with straightforward pricing and delivery you can track.
          </p>
          <p className="text-muted-foreground">
            For vendors, {APP_NAME} provides the tools to list products, manage orders, and grow a
            business - without needing to build an online store from scratch.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {VALUES.map((value) => {
            const Icon = Icons[value.icon];
            return (
              <div key={value.title} className="flex items-start gap-4 rounded-xl border p-6">
                <div className="rounded-full bg-primary/10 p-3 shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Button size="lg" asChild>
            <Link href="/products">
              Start Shopping
              <Icons.arrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
