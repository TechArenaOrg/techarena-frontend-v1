import { Metadata } from 'next';
import { Mail, Phone, MessageCircle } from 'lucide-react';
import { CONTACT_INFO, SOCIAL_LINKS, APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: `Get in touch with ${APP_NAME}.`,
};

const CHANNELS = [
  { icon: Mail, label: 'Email', value: CONTACT_INFO.EMAIL, href: `mailto:${CONTACT_INFO.EMAIL}` },
  { icon: Phone, label: 'Phone', value: CONTACT_INFO.PHONE, href: `tel:${CONTACT_INFO.PHONE.replace(/\s/g, '')}` },
  { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with us', href: SOCIAL_LINKS.WHATSAPP },
];

export default function ContactPage() {
  return (
    <main className="flex-1">
      <div className="container py-12 max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground">
            Have a question about an order, a product, or becoming a vendor? Reach us directly below.
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {CHANNELS.map((channel) => {
            const Icon = channel.icon;
            return (
              <a
                key={channel.label}
                href={channel.href}
                target={channel.href.startsWith('http') ? '_blank' : undefined}
                rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-4 rounded-xl border p-5 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="rounded-full bg-primary/10 p-3 shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{channel.label}</p>
                  <p className="font-medium">{channel.value}</p>
                </div>
              </a>
            );
          })}
        </div>

        <div className="rounded-xl border p-6 text-center space-y-2">
          <p className="font-medium">{CONTACT_INFO.ADDRESS}</p>
          <p className="text-sm text-muted-foreground">{CONTACT_INFO.BUSINESS_HOURS}</p>
        </div>
      </div>
    </main>
  );
}
