'use client';

import Link from 'next/link';
import { Phone, Home, LayoutGrid, MessageCircle, MapPin } from 'lucide-react';
import { CONTACT_INFO, SOCIAL_LINKS } from '@/lib/constants';

const NAV_ITEMS = [
  { label: 'Call', icon: Phone, href: `tel:${CONTACT_INFO.PHONE.replace(/\s+/g, '')}`, external: false },
  { label: 'Home', icon: Home, href: '/', external: false },
  { label: 'Categories', icon: LayoutGrid, href: '/categories', external: false },
  { label: 'WhatsApp', icon: MessageCircle, href: SOCIAL_LINKS.WHATSAPP, external: true },
  {
    label: 'Location',
    icon: MapPin,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_INFO.ADDRESS)}`,
    external: true,
  },
];

// Fixed tab bar shown only on phone-width screens, like a native app's bottom nav -
// gives quick one-tap access to the contact actions customers reach for most, instead
// of burying them in the header/footer. Hidden at lg+ where the full header already
// covers all of this.
export function MobileBottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-gray-800 bg-gray-900 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const content = (
          <>
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </>
        );
        const className = 'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-gray-300 hover:text-white transition-colors';

        return item.external ? (
          <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
            {content}
          </a>
        ) : (
          <Link key={item.label} href={item.href} className={className}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
